<template>
  <p>Declaration</p>
  <render_decl/>
  <p>Creation</p>
  <render_create/>
  <p>Iteration</p>
  <render_iter/>
</template>

<script>
export default { name: "query-cpp" }
</script>

<script setup>
import { defineProps, h } from 'vue';

const props = defineProps({
  result: {type: Object, required: true}
});

const defaultTrav = (term) => {
  if (!term.trav) {
    return !term.can_inherit;
  }

  if (term.trav.entity == "flecs.core.IsA") {
    if (term.flags.join("|") == "self|up") {
      return true;
    }
  } else {
    return false;
  }
}

const defaultSrc = (term) => {
  if (!term.src || term.src.var != "this") {
    return false;
  }
  return true;
}

const isTemplateArg = (term) => {
  if (!term.has_value) {
    return false;
  }
  if (!term.first) {
    return false;
  }
  if (!term.first.symbol) {
    return false;
  }
  if (!term.first.type) {
    return false;
  }
  if (term.oper == "or") {
    return false;
  }
  return true;
}

const isTemplateOnlyArg = (term) => {
  if (!isTemplateArg(term)) {
    return false;
  }
  if (term.second) {
    return false;
  }
  if (term.inout != "default" && term.inout != "in") {
    return false;
  }
  if (term.oper != "and") {
    return false;
  }
  if (!defaultSrc(term)) {
    return false;
  }
  if (!defaultTrav(term)) {
    return false;
  }
  return true;
}

const isSimpleQuery = (qi) => {
  for (const term of qi.terms) {
    if (!isTemplateOnlyArg(term)) {
      return false;
    }
  }
  return true;
}

const getCppSymbol = (sym) => {
  return sym.replaceAll(".", "::");
}

const refToken = (g, ref, asEntity) => {
  if (ref.var) {
    if (ref.var == "*") {
      g.identifier("flecs");
      g.operator("::");
      g.identifier("Wildcard");
    } else if (ref.var == "_") {
      g.identifier("flecs");
      g.operator("::");
      g.identifier("Any");
    } else if (ref.var == "$") {
      g.identifier("flecs");
      g.operator("::");
      g.identifier("Variable");
    } else {
      g.string("$" + ref.var);
    }
  } else if (ref.type && ref.symbol && asEntity) {
    g.identifier("world");
    g.operator(".");
    g.identifier("id");
    g.operator("<");
    g.type(getCppSymbol(ref.symbol));
    g.operator(">()");
  } else if (ref.name) {
    g.string(ref.name);
  } else {
    let elems = [];
    if (ref.entity) {
      elems = ref.entity.split(".");
    }
    if (elems.length == 3 && elems[0] == "flecs" && elems[1] == "core") {
      g.identifier("flecs");
      g.operator("::");
      if (ref.type) {
        g.type(elems[2]);
      } else {
        g.identifier(elems[2]);
      }
    } else {
      if (ref.symbol) {
        let symbol = getCppSymbol(ref.symbol);
        if (ref.type) {
          g.type(symbol);
        } else {
          g.identifier(symbol);
        }
      } else if (ref.entity) {
        if (ref.entity == "0") {
          g.number(0);
        } else {
          g.string(ref.entity);
        }
      }
    }
  }
}

const templateTokens = (g, qi) => {
  let i = 0;

  for (const term of qi.terms) {
    if (!isTemplateArg(term)) {
      continue;
    }

    if (!i) {
      g.operator("<");
    }

    if (i) {
      g.operator(", ");
    }
    if (term.inout == "in") {
      g.qualifier("const ");
    }

    refToken(g, term.first, false);
    i ++;
  }

  if (i) {
    g.operator(">");
  }

  return i != 0;
}

const argsTokens = (g, qi) => {
  let i = 0;

  g.operator("(");
  g.identifier("flecs");
  g.operator("::")
  g.type("entity");
  g.identifier(" e");

  for (const term of qi.terms) {
    if (!isTemplateArg(term)) {
      continue;
    }

    g.operator(", ");

    if (term.inout == "in") {
      g.qualifier("const ");
    }

    refToken(g, term.first, false);
    g.operator("&");
    i ++;
  }

  g.operator(")");

  return i != 0;
}

const travTokens = (g, term) => {
  for (const flag of term.flags) {
    if (flag == "self") {
      g.operator(".");
      g.function("self");
      g.operator("()");
    } else if (flag == "up" || flag == "cascade") {
      g.operator(".");
      g.function(flag);
      g.operator("(");
      if (term.trav.entity != "flecs.core.ChildOf") {
        refToken(g, term.trav);
      }
      g.operator(")");
    }
  }
}

const builderTokens = (g, qi) => {
  let i = 0, templateArg = 0;

  for (const term of qi.terms) {
    let isTemplate = false;
    if (isTemplateOnlyArg(term)) {
      templateArg ++;
      continue;
    }

    g.newLine();

    let firstDone = false, secondDone = term.second == undefined;
    if (isTemplateArg(term)) {
      firstDone = true;
      templateArg ++;
      g.operator(".");
      g.function("term_at");
      g.operator("(");
      g.number(templateArg - 1);
      g.operator(")");

      if (term.second) {
        g.operator(".");
        g.function("second");
        if (term.second.type && term.second.symbol) {
          g.operator("<");
          g.type(term.second.symbol);
          g.operator(">()");
        } else {
          g.operator("(");
          refToken(g, term.second);
          g.operator(")");
        }
        secondDone = true;
      }

      isTemplate = true;
    } else {
      g.operator(".");  
      if (term.oper == "not") {
        g.function("without")
      } else {
        g.function("with")
      }

      if (term.first.type && term.first.symbol) {
        g.operator("<");
        refToken(g, term.first, false);
        firstDone = true;
        if (term.second) {
          if (term.second.type && term.second.symbol) {
            g.operator(", ");
            refToken(g, term.second, false);
            secondDone = true;
          }
        }
        g.operator(">");
      }

      g.operator("(");
      if (!firstDone) {
        refToken(g, term.first, true);
      }

      if (!secondDone) {
        if (!firstDone) {
          g.operator(", ");
        }
        refToken(g, term.second, true);
      }
      g.operator(")");
    }

    if (!defaultSrc(term)) {
      g.operator(".");
      g.function("src");
      g.operator("(");
      refToken(g, term.src, true);
      g.operator(")");
    }

    if (!defaultTrav(term)) {
      travTokens(g, term);
    }

    let inout_default = "default";
    if (!isTemplate) {
      inout_default = "none";
    }

    if (term.inout != inout_default && term.inout != "default") {
      if (!isTemplate || term.inout != "in") {
        g.operator(".");
        g.function(term.inout);
        g.operator("()");
      }
    }

    if (term.oper != "and" && term.oper != "not") {
      g.operator(".");
      if (term.oper == "or") {
        g.function("or_");
      } else {
        g.function(term.oper);
      }
      g.operator("()");
    }
  }

  if (i) {
    g.operator(">");
  }

  return i != 0;
}

const token = (t, css) => {
  return h('span', {class: css}, t);
}

const generator = () => {
  return {
    elems: [],
    indent: 0,
    newline: false,
    push: function(t) {
      if (this.indent && this.newline) {
        this.elems.push(token(" ".repeat(this.indent * 2)));
      }
      this.elems.push(t);
      this.newline = false;
    },
    newLine: function() {
      this.elems.push("\n");
      this.newline = true;
    },
    operator: function(t) { this.push(token(t, "code-operator")) },
    keyword: function(t) { this.push(token(t, "code-keyword")) },
    qualifier: function(t) { this.push(token(t, "code-qualifier")) },
    type: function(t) { this.push(token(t, "code-type")) },
    identifier: function(t) { this.push(token(t, "code-identifier")) },
    function: function(t) { this.push(token(t, "code-function")) },
    string: function(t) { this.push(token('"' + t + '"', "code-string")) },
    number: function(t) { this.push(token(t, "code-number")) },
  };
}

const render_decl = () => {
  const qi = props.result.query_info;
  if (!qi) {
    return h('pre', []);
  }

  let g = generator();

  g.identifier("flecs");
  g.operator("::");
  g.identifier("query");
  if (!templateTokens(g, qi)) {
    g.operator("<>");
  }

  g.identifier(" q;");

  return h('pre', g.elems);
}

const render_create = () => {
  const qi = props.result.query_info;
  if (!qi) {
    return h('pre', []);
  }

  let g = generator();
  let simpleQuery = isSimpleQuery(qi);

  g.identifier("q");
  g.operator(" = ");
  g.identifier("world");
  g.operator(".");
  if (simpleQuery) {
    g.function("query");
  } else {
    g.function("query_builder");
  }

  templateTokens(g, qi);

  g.operator("()");
  if (simpleQuery) {
    g.operator(";");
  } else {
    g.indent ++;
    builderTokens(g, qi);
    g.newLine();
    g.operator(".");
    g.function("build");
    g.operator("();");
    g.indent --;
  }

  return h('pre', g.elems);
}

const render_iter = () => {
  const qi = props.result.query_info;
  if (!qi) {
    return h('pre', []);
  }

  let g = generator();

  g.identifier("q");
  g.operator(".");
  g.identifier("each");
  g.operator("([]");
  argsTokens(g, qi);
  g.operator(" {");
  g.newLine();
  g.newLine();
  g.operator("});");

  return h('pre', g.elems);
}

</script>

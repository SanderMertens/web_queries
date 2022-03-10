<<<<<<< HEAD
Vue.config.devtools = true;
=======

Vue.config.devtools = false;
>>>>>>> 19491602b1472716d562f98e633b221c14f1368c

// Track state of connection to remote app
const ConnectionState = {
  Initializing:     Symbol('Initializing'),
  Local:            Symbol('Local'),
  Connecting:       Symbol('Connecting'),
  RetryConnecting:  Symbol('RetryConnecting'),
  Remote:           Symbol('Remote'),
  ConnectionFailed: Symbol('ConnectionFailed')
};

// Short initial timeout to detect remote app. Should be long enough for
// an app to respond, but not too long to delay page load time.
const INITIAL_REQUEST_TIMEOUT = 300;

// Longer interval when we're sure the app is in remote mode.
const INITIAL_REMOTE_REQUEST_TIMEOUT = 10000;

// App will only retry connection when in explicit remote mode.
const INITIAL_REQUEST_RETRY_INTERVAL = 200;

// Interval at which the UI will poll the remote app.
const REFRESH_INTERVAL = 1000;

// Default port for the REST interface
const DEFAULT_PORT = "27750";
const DEFAULT_HOST = "127.0.0.1:" + DEFAULT_PORT;

// Example content for local demo
const example_selected = "Sun.Earth";
const example_query = "OrbitalSpeed, Mass, (ChildOf, _Parent)"
const example_plecs = `using flecs.meta
using flecs.units.Speed
using flecs.units.Mass

/// OrbitalSpeed component
Struct(OrbitalSpeed) {
  value = {f32, unit: KiloMetersPerSecond}
}

/// Mass component
Struct(Mass) {
  value = {f64, unit: KiloGrams}
}

/// The Sun
Sun {

  /// The Earth
  Earth {
    OrbitalSpeed = {29.7800}
    Mass = {5.9722e24}
    
    /// The Moon
    Moon {
      OrbitalSpeed = {1.022}
      Mass = {7.34767309e22}
    }    
  }
}

`

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return undefined;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const VALID_UNITS = ["px", "vw", "vh", "%"];

Vue.mixin({
  data: function() {
    return {
      originDims: {},
    }
  },
  methods: {
    convert: function(current_value, target_unit) {
      let converted_value;

      if (typeof(current_value == "number") && typeof(target_unit) == "string" && VALID_UNITS.includes(target_unit)) {
        // current_value must be number
        // target_unit must be valid unit string
        switch (target_unit) {
          case ("vw"):
            converted_value = current_value / window.innerWidth * 100;
            break;
          case ("vh"):
            converted_value = current_value / window.innerHeight * 100;
            break;
        } 
        return converted_value;
      } else {
        throw TypeError;
      }
    },
    emit_resize: function() {
      emitter.emit("layout_changed");
    },
    get_left: function(unit = "px") {
      let position;
      try {
        if (unit == "px") {
          position = this.$el.getBoundingClientRect().left;
        } else {
          position = this.convert(this.$el.getBoundingClientRect().left, unit);
        }
      } catch (e) {
        console.error(e);
      }
      return position;
    },
    get_right: function(unit = "px") {
      let position;
      try {
        if (unit == "px") {
          position = this.$el.getBoundingClientRect().right;
        } else {
          position = this.convert(this.$el.getBoundingClientRect().right, unit);
        }
      } catch (e) {
        console.error(e);
      }
      return position;
    },
    get_top: function(unit = "px") {
      let position;
      try {
        if (unit == "px") {
          position = this.$el.getBoundingClientRect().top;
        } else {
          position = this.convert(this.$el.getBoundingClientRect().top, unit);
        }
      } catch (e) {
        console.error(e);
      }
      return position;
    },
    get_bottom: function(unit = "px") {
      let position;
      try {
        if (unit == "px") {
          position = this.$el.getBoundingClientRect().bottom;
        } else {
          position = this.convert(this.$el.getBoundingClientRect().bottom, unit);
        }
      } catch (e) {
        console.error(e);
      }
      return position;
    },
    get_width: function(unit = "px") {
      let dimension;
      try {
        if (unit == "px") {
          dimension = this.$el.getBoundingClientRect().width;
        } else {
          dimension = this.convert(this.$el.getBoundingClientRect().width, unit);
        }
      } catch (e) {
        console.error(e);
      }
      return dimension;
    },
    get_height: function(unit = "px") {
      let dimension;
      try {
        if (unit == "px") {
          dimension = this.$el.getBoundingClientRect().height;
        } else {
          dimension = this.convert(this.$el.getBoundingClientRect().height, unit);
        }
      } catch (e) {
        console.error(e);
      }
      return dimension;
    },
    set_width: function(target_width_value, unit = "px") {
      if (typeof(target_width_value == "number") && typeof(unit) == "string" && VALID_UNITS.includes(unit)) {
        this.$el.style.width = target_width_value + unit;
      } else { throw TypeError; }
    },
    set_height: function(target_height_value, unit = "px") {
      if (typeof(target_height_value == "number") && typeof(unit) == "string" && VALID_UNITS.includes(unit)) {
        this.$el.style.height = target_height_value + unit;
      } else { throw TypeError; }
    },
    set_left: function(target_left_value, unit = "px") {
      if (typeof(target_left_value == "number") && typeof(unit) == "string" && VALID_UNITS.includes(unit)) {
        this.$el.style.left = target_left_value + unit;
      } else { throw TypeError; }
    },
    set_top: function(target_top_value, unit = "px") {
      if (typeof(target_top_value == "number") && typeof(unit) == "string" && VALID_UNITS.includes(unit)) {
        this.$el.style.top = target_top_value + unit;
      } else { throw TypeError; }
    },
  }
});

const emitter = mitt();

var app = new Vue({
  el: '#app',

  mounted: function() {
<<<<<<< HEAD

    this.$nextTick(_.debounce(() => {
      web_queries.then(() => {
=======
    this.$nextTick(() => {
      flecs_explorer.then(() => {
>>>>>>> 19491602b1472716d562f98e633b221c14f1368c
        this.ready();
      });

    }, 250));

    if (DEBUG_MODE && DEBUG_OPTIONS.mounting) { console.log("app", "mounted"); };
  },

  methods: {
    is_local() {
      return this.connection == ConnectionState.Local;
    },
    is_remote() {
      return this.connection == ConnectionState.Remote;
    },

    // Utility for sending HTTP requests
    http_request(method, host, path, recv, err, timeout, retry_interval) {
      const Request = new XMLHttpRequest();
      const url = host + "/" + path;

      Request.open(method, "http://" + url);
    
      if (timeout) {
        Request.timeout = timeout;
      }

      Request.request_aborted = false;

      Request.onreadystatechange = (reply) => {
        if (Request.readyState == 4) {
          if (Request.status == 0) {
            this.retry_count ++;

            // Retry if the server did not respond to request
            if (retry_interval) {
              retry_interval *= 1.3;
              if (retry_interval > 1000) {
                retry_interval = 1000;
              }

              this.$refs.terminal.clear();

              // No point in timing out sooner than retry interval
              if (timeout < retry_interval) {
                timeout = retry_interval;
              }

              this.$refs.terminal.err("request to " + host + " failed, " +
                "ensure app is running and REST is enabled " +
                "(retried " + this.retry_count + " times)");

              window.setTimeout(() => {
                this.http_request(method, host, path, recv, err, 
                  timeout, retry_interval);
              }, retry_interval);
            } else {
              if (err) err(Request.responseText);

              // If error callback did not set the connection state back to
              // local, treat this as a loss of connection event.
              if (this.connection != ConnectionState.Local) {
                if (!Request.request_aborted) {
                  this.connect();
                }
              }
            }
          } else {
            this.retry_count = 0;

            if (Request.status < 200 || Request.status >= 300) {
              if (err) {
                err(Request.responseText);
              }
            } else if (Request.responseText && Request.responseText.length) {
              if (recv) {
                recv(Request.responseText);
              }
            }
          }
        }
      }

      Request.send();

      return Request;
    },

    // Utility for sending HTTP requests that have a JSON reply
    json_request(method, host, path, recv, err, timeout, retry_interval) {
      return this.http_request(method, host, path, (r) => {
        const reply = JSON.parse(r);
        recv(reply);
      }, (r) => {
        if (err) {
          if (r != undefined && r.length) {
            const reply = JSON.parse(r);
            err(reply);
          } else {
            err();
          }
        }
      }, timeout, retry_interval);
    },

    // Abort request
    request_abort(id) {
      let r = this.requests[id];
      if (r) {
        r.request_aborted = true;
        r.abort();
      }
      this.requests[id] = undefined;
    },

    // Utility for sending HTTP requests to a remote app
    request(id, method, path, recv, err) {
      let existing = this.requests[id];
      if (existing) {
        if (existing.readyState == 4) {
          this.requests[id] = undefined;
        } else {
          // Request is still in progress
          return;
        }
      }
      this.requests[id] = this.json_request(
        method, this.host, path, recv, err);
    },

    // Data access
    request_entity: function(id, path, recv, err, params) {
      if (this.is_local()) {
          const r = wq_get_entity(path);
          const reply = JSON.parse(r);
          recv(reply);
      } else if (this.is_remote()) {
        let url_params = "";
        if (params) {
          for (var k in params) {
            url_params += "&" + k + "=" + params[k];
          }
        }
        this.request(id, "GET",
          "entity/" + path.replaceAll('.', '/') + url_params, recv, err);
      }
    },

    request_query: function(id, q, recv, err, params) {
      if (this.is_local()) {
          const r = wq_query(q);
          const reply = JSON.parse(r);
          recv(reply);
      } else if (this.is_remote()) {
        let url_params = "";
        if (params) {
          for (var k in params) {
            url_params += "&" + k + "=" + params[k];
          }
        }
        this.request(id,
          "GET", "query?q=" + encodeURIComponent(q) + url_params,
          recv, err);
      }
    },

    insert_code: function(code, recv, timeout) {
      if (this.is_local()) {
        if (this.parse_timer) {
          clearTimeout(this.parse_timer);
        }

        const func = () => {
          const r = wq_run(code);
          const reply = JSON.parse(r);
          recv(reply);
          this.parse_timer = undefined;
        };

        if (timeout) {
          this.parse_timer = setTimeout(func, timeout);
        } else {
          func();
        }
      }
    },

    init_remote() {
      const q_encoded = getParameterByName("q");
      var selected = getParameterByName("s");
      var q;

      if (q_encoded) {
        q = wq_decode(q_encoded);
      }

      if (selected) {
        this.selected_entity = selected;
      }
      if (q) {
        this.$refs.query.set_query(q);
      }
    },

    ready_remote(reply) {
      // Get application name from reply
      if (reply.label && reply.label != "World") {
        this.title = reply.label;
      }

      this.parse_interval = 150;
      this.$refs.tree.update_expanded();

      // Refresh UI periodically
      this.refresh_timer = window.setInterval(() => {
        this.refresh_query();
        this.refresh_entity();
        this.refresh_tree();
      }, REFRESH_INTERVAL);
    },

    ready_local() {
      this.selected_entity = undefined;

      const q_encoded = getParameterByName("q");
      const p_encoded = getParameterByName("p");
      var selected = getParameterByName("s");
      var p, q;

      if (p_encoded) {
        p = wq_decode(p_encoded);
      }
      if (q_encoded) {
        q = wq_decode(q_encoded);
      }
      if (selected === undefined && !p_encoded && !q_encoded) {
        selected = example_selected;
      }

      if (!p && !p_encoded) {
        p = example_plecs;
      }
      if (!q && !q_encoded) {
        q = example_query;
      }

      if (p && !this.remote_mode) {
        this.$refs.plecs.set_code(p);
        this.$refs.plecs.run();
      }

      if (selected) {
        this.$refs.tree.select(selected);
      }
      if (q) {
        this.$refs.query.set_query(q);
      }

      this.$refs.tree.update_expanded();

      this.parse_interval = 150;
    },

    // Connect to a remote host
    connect() {
      if (this.connection == ConnectionState.Remote) {
        this.connection = ConnectionState.RetryConnecting;
      } else if (this.connection != ConnectionState.Connecting &&
          this.connection != ConnectionState.RetryConnecting) {
        this.connection = ConnectionState.Connecting;
      } else {
        // Already connecting
        return;
      }

      // Reset application connection status
      this.retry_count = 0;

      if (this.refresh_timer) {
        window.clearInterval(this.refresh_timer);
      }

      // Retry interval (only when forcing remote mode)
      let retry_interval = 0;

      // Optional parameters for selecting host & port.
      let host = getParameterByName("host");
      let port = getParameterByName("port");

      // If remote param is provided, don't go to local mode
      let remote = getParameterByName("remote");

      // remote_self is the same as remote, but will always connect to the URL
      // of the explorer, instead of defaulting to localhost
      let remote_self = getParameterByName("remote_self");

      // If local param is provided, don't connect to remote
      let local = getParameterByName("local");

      // If a code snippet is provided, run in local mode
      if (getParameterByName("p")) {
        local = true;
      }

      // Store URL parameters so they can be added to shared URL
      this.params.host = host;
      this.params.port = port;
      this.params.remote = remote;
      this.params.remote_self = remote_self;
      this.params.local = local;

      // Make sure that if both remote_self and host are specified they match
      if (remote_self) {
        if (host != undefined && host != window.location.hostname) {
          console.err("remote_self conflicts with value of host param, starting in local mode");
          this.ready_local();
        }
        remote = true;
        host = window.location.hostname;
      }

      // Can't set both local and remote
      if (remote && local || host && local) {
        console.err("invalid combination of URL params, starting in local mode");
        this.ready_local();
      }

      // If we are reconnecting, use same paramaters. This also ensures that
      // once connected, the UI stays in remote mode.
      if (this.connection == ConnectionState.RetryConnecting) {
        host = this.host;
        remote = true;
      }

      // Check if a host is provided as parameter
      if (!local) {
        if (!host) {
          host = DEFAULT_HOST;
        } else {
          remote = true;
        }
      } else {
        remote = false;
      }

      if (host) {
        if (host.indexOf(':') == -1) {
          if (!port) {
            port = DEFAULT_PORT;
          }
          host += ":" + port;
        }

        if (remote) {
          retry_interval = INITIAL_REQUEST_RETRY_INTERVAL;
        }

        if (this.connection != ConnectionState.RetryConnecting) {
          /* When not reconnecting initialize app from URL arguments */
          this.init_remote();
        }

        let timeout = INITIAL_REQUEST_TIMEOUT;
        if (remote) {
          /* Tolerate a larger timeout when we're guaranteed in remote mode */
          timeout = INITIAL_REMOTE_REQUEST_TIMEOUT;
        }

        this.json_request("GET", host, "entity/flecs/core/World?label=true", (reply) => {
          this.host = host;
          this.connection = ConnectionState.Remote;
          this.ready_remote(reply);
        }, () => {
          if (!remote) {
            this.connection = ConnectionState.Local;
            this.ready_local();
          } else {
            console.warn("remote connection failed, running explorer in local mode");
            this.connection = ConnectionState.ConnectionFailed;
          }
        }, timeout, retry_interval);
      } else {
        this.connection = ConnectionState.Local;
        this.ready_local();
      }
    },

    ready() {
      this.connect();
    },

    // Set inspector to entity by pathname
    set_entity(path) {
      this.request_abort('inspector'); // Abort outstanding requests
      this.entity_result = undefined;

      this.selected_entity = path;
      if (!path) {
        return;
      }

      this.refresh_entity();
      this.refresh_terminal();
    },

    set_entity_by_tree_item(item) {
      if (item) {
        this.set_entity(item.path);
      } else {
        this.set_entity();
      }
    },

    refresh_terminal() {
      this.$refs.terminal.clear();

      if (this.code_error) {
        this.$refs.terminal.log({text: "Code error: " + this.code_error, kind: "command-error" });
      }

      const q_err = this.$refs.query.get_error();
      if (q_err) {
        this.$refs.terminal.log({text: "Query error: " + q_err, kind: "command-error" });
      }
    },

    refresh_query() {
      this.$refs.query.refresh();
    },

    refresh_entity() {
      if (!this.selected_entity) {
        return;
      }
      this.request_entity('inspector', this.selected_entity, (reply) => {
        this.entity_error = reply.error;
        if (this.entity_error === undefined) {
          this.entity_result = reply;
          this.$refs.inspector.expand();
        }
      }, () => {
        this.entity_error = "request for entity '" + this.selected_entity + "' failed";
      }, {type_info: true, label: true, brief: true, link: true, id_labels: true, values: true});
    },

    refresh_tree() {
      this.$refs.tree.update_expanded();
    },

    // Query changed event
    evt_query_changed(query) {
      this.refresh_terminal();
    },

    // Code changed event
    evt_code_changed(code) {
      this.insert_code(code, (reply) => {
        this.code_error = reply.error;
        if (reply.error === undefined) {
          this.refresh_query();
          this.$refs.tree.update_expanded();
          this.refresh_entity();
        }
        this.refresh_terminal();
      }, this.parse_interval);
    },

    // Entity selected
    evt_entity_changed(e) {
      this.set_entity_by_tree_item(e);
    },

    // Follow entity reference
    evt_follow_ref(entity) {
      this.set_entity(entity);
    },

    evt_select_query(query) {
      this.$refs.query.set_query(query);
    },

    show_url() {
      const query = this.$refs.query.get_query();
      
      let plecs;
      let plecs_encoded;
      if (this.$refs.plecs) {
        plecs = this.$refs.plecs.get_code();
        plecs_encoded = wq_encode(plecs);
      }

      const query_encoded = wq_encode(query);
      let sep = "?";
    
      this.url = window.location.protocol + '//' + 
                 window.location.host + 
                 window.location.pathname;

      if (this.params.host) {
        this.url += sep + "host=" + this.params.host;
        sep = "&";
      }

      if (this.params.port) {
        this.url += sep + "port=" + this.params.port;
        sep = "&";
      }

      if (this.params.remote) {
        this.url += sep + "remote=true";
        sep = "&";
      }

      if (this.params.remote_self) {
        this.url += sep + "remote_self=true";
        sep = "&";
      }

      if (this.params.local) {
        this.url += sep + "local=true";
        sep = "&";
      }

      if (query_encoded) {
        this.url += sep + "q=" + query_encoded;
        sep = "&";
      }

      if (plecs_encoded) {
        this.url += sep + "p=" + plecs_encoded;
        sep = "&";
      }

      if (this.selected_entity) {
        this.url += sep + "s=" + this.selected_entity;
        sep = "&";
      }

      this.$refs.url.show();
    },
  },

  computed: {
    valid: function() {
      return !this.code_error &&
        (this.connection == ConnectionState.Local ||
          this.connection == ConnectionState.Remote ||
            this.retry_count < 10);
    },
    remote_mode: function() {
      return this.connection == ConnectionState.Remote || this.params.remote ||
        this.params.remote_self || this.params.host;
    }
  },

  data: {
    title: "Flecs",
    query_error: undefined,
    entity_error: undefined,
    code_error: undefined,
    query_result: undefined,
    entity_result: undefined,
    selected_entity: undefined,
    selected_tree_item: undefined,
    url: undefined,
    params: {},

    connection: ConnectionState.Initializing,
    host: undefined,
    retry_count: 0,
    request_count: 0,

    requests: {},
    refresh_timer: undefined,
    parse_timer: undefined,
    parse_interval: 0
  }
});
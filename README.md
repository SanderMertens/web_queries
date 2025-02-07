# Flecs Explorer
Web-based UI for monitoring Flecs applications, trying out queries &amp; learning ECS

<img width="1038" alt="Screen Shot 2022-06-01 at 3 42 48 PM" src="https://user-images.githubusercontent.com/9919222/171513654-894549df-8ad5-4d39-a82a-d57e425ece9e.png">

A live version of the explorer is running @ https://flecs.dev/explorer

## Usage
The flecs explorer can be used in standalone mode (default) or remote mode. In standalone mode, the application runs 100% in the browser with a webasm build of Flecs. In remote mode, the explorer connects to a running flecs application.

### Connecting to a running Flecs application
Before connecting the explorer to an application, first make sure that the REST interface is enabled:

In C:
```c
ecs_singleton_set(world, EcsRest, {0});
```

In C with the app addon:
```c
ecs_app_run(world, &(ecs_app_desc_t) {
  .enable_rest = true
});
```

In C++:
```cpp
world.set<flecs::rest::Rest>({});
```

In C++ with the app addon:
```cpp
world.app()
  .enable_rest()
  .run();
```

When the application is running, verify that the server works by going to:
http://localhost:27750/entity/flecs

This should return a JSON string that looks similar to:
```json
{"path":"flecs", "type":[{"pred":"Module"}, {"pred":"Identifier", "obj":"Name"}, {"pred":"flecs.doc.Description", "obj":"flecs.doc.Brief", "value":{"value":"Flecs root module"}}, {"pred":"flecs.doc.Description", "obj":"flecs.doc.Link", "value":{"value":"https://github.com/SanderMertens/flecs"}}]}
```

You can now go to https://flecs.dev/explorer which should automatically connect to your application. 

The explorer sends a request with a short timeout to determine if a running application can be found. In some cases this timeout is too short, which can cause the explorer to sometimes not connect. To fix this, add `?remote=true` to the URL (See URL options).

Note that _no_ data is sent from your application to a remote machine. The explorer runs 100% in the browser, so any information sent to the explorer uses a local loopback interface (in other words, no information leaves your machine).

The following browsers have known policies that prevent connecting to localhost from a remote URL:
 - Safari
 - Brave (can be overridden by configuring "Shield" to be down)

To get around this, you can:

### Host the explorer locally
If your browser does not support connecting to localhost from a remote URL, or you just prefer to host the explorer yourself, first clone the repository:

```
git clone https://github.com/flecs-hub/explorer
```

Then start an HTTP server in the `etc` folder:

```
cd explorer/etc
python3 -m http.server
```

You can now go to http://localhost:8000 to open the explorer.

### Run the explorer as Docker image
If you have a docker environment, you can host the explorer by running this command:
```
docker run --name=explorer -p 80:80 --restart=unless-stopped -d sandermertens/flecs.explorer:latest
```

You can now go to http://localhost to open the explorer.

### Statistics
The explorer can visualize statistics from Flecs applications. Statistics collection is disabled by default as it is not free. To enable it, import the `flecs.monitor` module:

In C:
```c
ECS_IMPORT(world, FlecsMonitor);
```

In C++:
```c
world.import<flecs::monitor>();
```

Note that the statistics collection systems run as part of the default Flecs pipeline. If your application does not use systems, manually runs systems or uses a custom pipeline statistics collection will not run. To make sure the collection systems are ran, call this once in the main loop of your game:

In C:
```c
ecs_progress(world, 0);
```

In C++
```c
world.progress();
```

You should now be able to see statistics in the explorer, which should look like this:

<img width="1231" alt="Screen Shot 2022-06-04 at 1 14 49 AM" src="https://user-images.githubusercontent.com/9919222/171993359-d3d31208-6e7e-46ad-909e-c5f80fa492d3.png">

### URL options
The following options can be added to the URL:

**Always connect to remote app (will keep trying to connect to localhost:27750)**
```
?remote=true
```

**Always connect to app on same URL as explorer (will keep trying to connect to url:27750)**
```
?remote_self=true
```

**Never connect to remote app (will always use the webasm version of flecs that runs in the browser)**
```
?local=true
```

**Specify a custom host to connect to (sets remote to true)**
```
?host=10.20.30.40:1234
```

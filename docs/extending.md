# Extending the Video Player Framework
The architecture of the framework is strongly (web)component-based. Therefore, it is quite easy to extend the framework by new features.
In most cases a [new component](#creating-a-new-component) needs to be developed and integrated in the existing ones.
Depending on the complexity of the new feature, you might also need to write a [new service](#creating-a-new-service) of interaction of multiple components.

## Creating a new Component
The framework uses [Polymer 3](https://www.polymer-project.org) for creating reusable WebComponents.
Therefore, also check to the [Polymer docs](https://www.polymer-project.org/3.0/docs/devguide/feature-overview) before writing a new component.

### Structure & Data Flow
The general structure of a component is always the same. There is a [template](component-template.js) for new components, which can be used as foundation.

Most components need to know the state of the video player. It needs to be passed into the component as an attribute and can then be accessed via `this.state.playState`.
However, changes to the state need to be performed using the [StateManager](../src/services/state-manager.js). It is [injected](#dependency-injection) into the component and can be used like `this._stateManager.play()`.

If your component needs to react to changes of the state, you need to register a property observer.
This is done by creating the static read-only `observers` property (or adapting it) as follows:
```js
static get observers() {
  return [
    '_playStateChanged(state.playState)' // _playStateChanged is called everytime state.playState changes
  ];
}
```
You can also add observers for multiple properties and private properties of the component.
For more detailed information about observers refer to the [Polymer docs](https://www.polymer-project.org/3.0/docs/devguide/observers).

When you finished your component, you need to integrate it into the existing components.
To do so, you need to edit the component, in which your new component should be integrated.
You need to import the new component and use the tag of it in the template as follows:
```js
...
import './new-component.js';
...
static get template() {
  return html`
    <template>
      ...
      <new-component state="[[state]]"></new-component>
      ...
    </template>
  `;
}
...
```
If you defined additional public properties, you might add them to the tag.

### Configuration Parameters
A video-player instance is configured by passing a configuration as JSON object as attribute (see [configuration.md](configuration.md)).
You can add options to the configuration for your new component. To do so, you need to add the new option and its metadata to the [configuration-schema.js](../src/configuration-schema.js) file.
Since the file is also used for generation of the configuration docs, execute the command `npm run generate-docs` to update the docs.

If you want to provide a default value for the option, it needs to be added to the `DEFAULT_CONFIGURATION` in [constants.js](../src/constants.js).

Last but not least you need to pass the configuration option to your component. The entire configuration object is available in the [video-player.js](../src/video-player.js) component.

`src/video-player.js`
```html
...
<new-component state="[[state]]" conf-option="[[configuration.confOption]]"></new-component>
...
```

### Dependency Injection
For the interaction between multiple components we use services. The video player uses an IoC kernel for dependency injection of services.
You can retrieve the instance of a specific service, i.e. the `StateManager`, by defining a private property the following way:
```js
static get properties() {
  return {
    ...
    _stateManager: {
      type: Object,
      inject: 'StateManager', // The name of the service
    },
    ...
  };
}

servicesInjectedCallback() {
  super.servicesInjectedCallback();

  // Services are injected here
}
```
During initialization of the component, the corresponding instance of the service is injected into the property.
After all services have been injected, the `servicesInjectedCallback` is executed.

### Localization
The framework supports localization of strings. In order to make your component ready for localization, you need to adapt it in the following way.

First, you need to apply the `LocalizationMixin` to your component.
```js
// Import mixin module
// Make sure, the path is correct
import '../mixins/localization.js';
...
// Apply mixin
class NewComponent extends BindingHelpersMixin(IocRequesterMixin(LocalizationMixin(Polymer.Element))) {
  ...
}

window.customElements.define(NewComponent.is, NewComponent);
```

After that, you can use the `localize` function in your component to localize strings. The string is automatically updated when the language of the player changes.
```html
<p>[[localize('message-key')]]</p>
```

The locale files are located in [src/locales](../src/locales) and can be extended by new messages.

## Creating a new Service
In some cases it might be necessary to create a new service for the interaction of multiple components.
Services are ES6 classes defined as modules.
There is also a [template](service-template.js) for new services.

Since the framework uses dependency injection for services, you need to register your service in the [video-player.js](../src/video-player.js) component in the following way:
```js
// Import service module
import { NewService } from 'services/new-service.js';
...
class VideoPlayer extends BindingHelpersMixin(IocRequesterMixin(IocProviderMixin(Polymer.Element))) {
  ...

  // Services need to get registered in bindServices function
  bindServices(iocKernel) {
    super.bindServices(iocKernel);

    // The very same instance of the service is injected into each component
    iocKernel.bind('NewService').toFunction(() => new NewService()).inSingletonScope();

    // A new instance of the service is injected into each component
    iocKernel.bind('NewService').toFunction(() => new NewService()).inTransientScope();
  }

  ...
}
```

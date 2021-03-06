/* @polymerMixin */
export const LocalizationMixin = (superClass) => class extends superClass {
  static get properties() {
    return {
      localize: {
        type: Function,
      },
      _localizer: {
        type: Object,
        inject: 'Localizer',
        observer: '_localizerChanged',
      },
    };
  }

  _localizerChanged(localizer) {
    if(localizer && localizer.localize) {
      this.localize = localizer.localize.bind(localizer);

      // Update localize function, if language changed so that all localizes strings are reevaluated
      localizer.onLanguageChanged(() => this.localize = localizer.localize.bind(localizer));
    }
  }
};

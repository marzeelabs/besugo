export default (props, xplaceholder) => {
  props.locale = xplaceholder.getChildren('Locale')[0].getAttribute('value');
  props.activeUrl = xplaceholder.getChildren('ActiveUrl')[0].getAttribute('value');
  props.email = xplaceholder.getChildren('Email')[0].getAttribute('value');

  props.buttons = xplaceholder
    .getChildren('Button')
    .map(button => ({
      label: button.getAttribute('label'),
      active: button.getAttribute('url') === props.activeUrl,
    }));

  props.options = xplaceholder
    .getChildren('Option')
    .map(button => ({
      label: button.getAttribute('label'),
    }));

  props.strings = {};
  xplaceholder
    .getChildren('String')
    .forEach((string) => {
      const category = string.getAttribute('category');
      const name = string.getAttribute('name');
      const value = string.getAttribute('value');

      if (!props.strings[category]) {
        props.strings[category] = {};
      }
      props.strings[category][name] = value;
    });
};

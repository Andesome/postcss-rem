const postcss = require('postcss');

const pluginName = 'postcss-rem';
const functionName = 'rem';
const defaults = {
  baseline: 16,
  convert: 'rem',
  fallback: false,
  precision: 5,
  /** multiply or division baseline  */
  type: "div", // multi or div
};

module.exports = postcss.plugin(pluginName, (opts = {}) => (root) => {
  const options = Object.assign({}, defaults, opts);
  const regexp = new RegExp('(?!\\W+)' + functionName + '\\(([^\(\)]+)\\)', 'g');

  const rounded = (value, precision) => {
    precision = Math.pow(10, precision);
    return Math.floor(value * precision) / precision;
  };

  const convert = (values, to, type) => values.replace(/(\d*\.?\d+)(rem|px)/g, (match, value, from) => {
    if(type === 'multi'){
      return rounded(parseFloat(value) * options.baseline, options.precision) + to;
    } else {
      return rounded(parseFloat(value) / options.baseline, options.precision) + to;
    }
    return match;
  });

  if (options.fallback && options.convert !== 'px') {
    root.walkDecls((decl) => {
      if (decl.value && decl.value.includes(functionName + '(')) {
        let values = decl.value.replace(regexp, '$1');
        decl.cloneBefore({
          value: convert(values, 'px')
        });
        decl.value = convert(values, 'rem');
      }
    });
  } else {
    root.replaceValues(regexp, { fast: functionName + '(' }, (_, values) => convert(values, options.convert, options.type));
  }
});

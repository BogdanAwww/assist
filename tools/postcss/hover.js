const postcss = require('postcss');
const Rule = postcss.Rule;
const AtRule = postcss.AtRule;

module.exports = (opts = {}) => {
    return {
        postcssPlugin: 'postcss-hoverable',
        Once(root, { result }) {
            const newRules = [];
            root.walkRules(function (rule) {
                if (~rule.selector.indexOf(':hover')) {
                    const hoverSelectors = rule.selectors.filter((selector) => ~selector.indexOf(':hover'));
                    rule.selectors = rule.selectors.filter((selector) => !~selector.indexOf(':hover'));

                    const newRule = rule.clone();
                    newRule.selectors = hoverSelectors;

                    const mediaRule = new AtRule({
                        name: 'media',
                        params: '(min-width:768px)'
                    });
                    mediaRule.append(newRule);

                    newRules.push(mediaRule);
                }
            });
            newRules.forEach((rule) => root.append(rule));
        }
    };
};

module.exports.postcss = true

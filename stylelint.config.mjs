export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['mixin']
      }
    ],
    'declaration-empty-line-before': null,
    'no-descending-specificity': null,
    'order/properties-order': [
      [
        {
          emptyLineBefore: 'always',
          groupName: 'Positioning',
          properties: ['position', 'inset', 'top', 'right', 'bottom', 'left', 'z-index']
        },
        {
          emptyLineBefore: 'always',
          groupName: 'Layout',
          properties: [
            'box-sizing',
            'display',
            'flex',
            'flex-direction',
            'flex-wrap',
            'align-items',
            'justify-content',
            'gap',
            'row-gap',
            'column-gap',
            'grid',
            'grid-template',
            'grid-template-columns',
            'grid-template-rows',
            'grid-column',
            'grid-row'
          ]
        },
        {
          emptyLineBefore: 'always',
          groupName: 'Sizing',
          properties: ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height']
        },
        {
          emptyLineBefore: 'always',
          groupName: 'Spacing',
          properties: [
            'margin',
            'margin-top',
            'margin-right',
            'margin-bottom',
            'margin-left',
            'padding',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left'
          ]
        },
        {
          emptyLineBefore: 'always',
          groupName: 'Typography',
          properties: [
            'font',
            'font-family',
            'font-size',
            'font-weight',
            'line-height',
            'letter-spacing',
            'text-align',
            'text-decoration',
            'text-transform',
            'white-space',
            'color'
          ]
        },
        {
          emptyLineBefore: 'always',
          groupName: 'Visual',
          properties: [
            'background',
            'background-color',
            'border',
            'border-top',
            'border-right',
            'border-bottom',
            'border-left',
            'border-radius',
            'box-shadow',
            'opacity'
          ]
        },
        {
          emptyLineBefore: 'always',
          groupName: 'Motion',
          properties: ['transform', 'transition', 'animation']
        }
      ],
      {
        unspecified: 'bottomAlphabetical'
      }
    ],
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global']
      }
    ]
  }
};

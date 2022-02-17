import theme from './theme';

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    backgrounds: { disable: true, grid: { disable: true } },
    docs: { theme },
    options: {
        storySort: {
            order: [
                'Docs',
                [
                    'Introduction',
                    'Features',
                    'Explore',
                    [
                        'Demos',
                        'Plugins',
                        'Showcase'
                    ],
                    'Getting Started',
                    [
                        'Installation'
                    ],
                    'Usage',
                    [
                        'Architecture',
                        'Initialization',
                        'Configuration',
                        'State',
                        'API',
                        'Declarative DOM APIs',
                        'Troubleshooting'
                    ],
                    'Plugins',
                    [
                        'Introduction',
                        'Render UI',
                        'Store State',
                        'Detect Interaction',
                        'Specify Behavior'
                    ]
                ],
                'Demos'
            ]
        }
    },
    previewTabs: {
        'storybook/docs/panel': {
            hidden: true
        }
    },
    viewport: { disable: true }
}
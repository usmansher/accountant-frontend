const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx}',
        flowbite.content(),
    ],
    theme: {},
    plugins: [
        require('@tailwindcss/forms'),
        require('flowbite/plugin'),
        flowbite.plugin(),
    ],
}

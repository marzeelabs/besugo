# MZ Netlify 

## Requirements
1. [hugo](https://gohugo.io/), install using [homebrew](https://brew.sh/) if you don't have it already: ```brew install hugo```
2. [yarn](https://yarnpkg.com/), you'll probably want to install with ```brew install yarn --without-node``` as to not override your system's Node.js or if you use nvm to manage node versions.

## Install and Run
1. Clone project locally
2. If upgrading an existing project from npm, or whenever you need to rebuild dependencies, run ```yarn rebuild``` (shortcut to ```rm -rf node_modules & yarn install``` that I wrote to myself and left in); otherwise grab dependencies normally with ```yarn install```;
3. It's recommended to change the default port in ```package.json```, to avoid having to worry about other Besugo projects being served on the same port.
4. ```yarn start``` task serves the site locally and starts listening for changes

## Deploy on Netlify
1. Push your Hugo project to Github
2. [Get a Netlify account](https://app.netlify.com/signup)
3. Choose your Github repository and branch, **use build command `yarn build`** and set *public/* as your Public Folder.

## Activate Netlify CMS
1. Set the correct repo and branch on the provided *static/admin/config.yml*
2. Create a new Github application following [Netlify's instructions](https://github.com/netlify/netlify-cms/blob/master/docs/quick-start.md) - don't forget the `https://api.netlify.com/auth/done` callback URL.
3. Go to your Netlify dashboard, select your site, navigate to Access > Authentication Providers > Install Provider > Github and use the Client ID and Secret generated in step 2.
4. Start using the CMS on **http://[your-website-url]/admin**

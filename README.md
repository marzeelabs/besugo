# MZ Netlify

## Install and Run
0. Requires [hugo](https://gohugo.io/), install using [homebrew](https://brew.sh/) if you don't have it already: ```brew install hugo```
1. Install gulp-cli globally: ```npm install -g gulp-cli```
2. Clone project locally
3. Grab dependencies normally: ```npm install```
4. Default ```gulp``` task serves and starts listening for changes

## Deploy on Netlify
1. Push your Hugo project to Github
2. [Get a Netlify account](https://app.netlify.com/signup)
3. Choose your Github repository and branch, **use build command `gulp netlify`** and set *public/* as your Public Folder.

## Activate Netlify CMS
1. Set the correct repo and branch on the provided *static/admin/config.yml*
2. Create a new Github application following [Netlify's instructions](https://github.com/netlify/netlify-cms/blob/master/docs/quick-start.md) - don't forget the `https://api.netlify.com/auth/done` callback URL.
3. Go to your Netlify dashboard, select your site, navigate to Access > Authentication Providers > Install Provider > Github and use the Client ID and Secret generated in step 2.
4. Start using the CMS on **http://[your-website-url]/admin**

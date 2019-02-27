# Besugo

An awesome light-weight boilerplate to build an awesome static site, integrating [Netlify CMS](https://www.netlifycms.org/) to be able to edit content, committing changes directly in Github and triggering new awesome live builds immediately. It's awesome!

### Examples out there in the world

- [Portuguese Women in Tech](https://portuguesewomenintech.com/) - the very beginning of Besugo, developed first and every part of it was generalised to make way for this project and for many other websites still in development.

## Requirements

Below are listed the versions used in Netlify to create the live, preview and branch builds. Ideally you'd be using the exact same versions locally, although there's some wiggle room of course.

0. [homebrew](https://brew.sh/) - a package manager for macOS, to manage applications such as `hugo` and `yarn` listed below.

    - Install:
      ```sh
      /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
      ```
    - If after running the above command it complains that *xcode alone is not sufficient on sierra*, try running `xcode-select --install`. Note that **macOS Sierra 10.12.6 or higher and XCode 9.2 are required.**


1. [hugo](https://gohugo.io/) v0.53 - builds the structure of the website based on the content setup, although we're phasing it out in favor of a fully JS/React solution. Any version over 0.27.1 should still work though.

    - Install:
      ```sh
      brew install hugo
      ```
    - Update:
      ```sh
      brew update && brew upgrade hugo
      ```

2. [yarn](https://yarnpkg.com/) v1.12.3 - package/dependency manager. Any version of yarn above 0.27.5 should still work though.

    - Install:
      ```sh
      brew install yarn --without-node
      ```
    - Update:
      ```sh
      brew update && brew upgrade yarn
      ```
    - List installed yarn versions:
      ```sh
      brew list yarn --versions
      ```
    - Switch between yarn versions (global change):
      ```sh
      brew switch yarn 1.12.3
      ```

3. [nvm](https://github.com/creationix/nvm) v0.33.11 - (not used by Netlify), very useful to manage your locale Node.js versions.

    - Install or update:
      ```sh
      curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
      ```

    - After installing you may need to re-open the terminal or run this for it to recognize the `nvm` command (repeat for every terminal you currently have open in which you want to use it):
      ```sh
      source ~/.bash_profile
      ```

4. [Node.js](https://nodejs.org/en/) v8.12.0 LTS (lts/carbon) - our JavaScript runtime, we need it, for everything. Any Node v8.x.x or even v6.x.x (lts/boron) should still work though.

    - Install or update:
      ```sh
      nvm install lts/carbon
      ```
      Or to immediately install the global packages from another version (including `system`):
      ```sh
      nvm install lts/carbon --reinstall-packages-from=[SOME_VERSION]
      ```
    - I like aliases:
      ```sh
      nvm alias 8 lts/carbon
      ```
    - Switch version in the current terminal session:
      ```sh
      nvm use 8
      ```

## Install and Run

1. Clone project locally

2. Install dependencies:
    ```sh
    yarn install
    ```

3. (Optional, recommended) change the port in *package.json*, to avoid having other Besugo projects being served on the same port, for easier window/tab management during development.

4. Serve on localhost via **webpack** and listen for changes (hot reloads in most cases):
    ```sh
    yarn start
    ```

5. In your browser navigate to `http://localhost:1313`; don't forget to change the port to whatever you set in bullet point 3.

## Upgrade projects (gulp, pre-yarn/webpack)

1. Rebuild all dependencies; also for any time you need to rebuild *node_modules* from scratch, such as when upgrading **node** or **yarn**:
    ```sh
    yarn rebuild
    ```
    (shortcut to ```rm -rf node_modules & yarn install```);

2. Remove leftover js files in static folder:
    - *static/css/cms-override.css*
    - *static/js/site.min.js*
    - *static/js/main.min.js*
    - *static/js/app.min.js*
    - *static/admin/main.min.js*


3. (Resume from bullet point 3 in the *Install and Run* section above)

## From the Boilerplate to an Actual Project

### Content

Content is of course the main focus of the website. Content types are defined in the file *cms/config.yml* and content entries are saved in the directory *content* as `.md` files.

- See **Using Netlify CMS** below to create and edit content using the admin interface, otherwise you can just edit the files directly as code if you know what you're doing.

### Layouts

The folder *layouts* contains `.html` files defining, you guessed it, the layout of that content.

- The starting points are *layouts/_default/baseof.html*, defining the basic markdown of every page, and *layouts/index.html*, which defines the homepage.

- Create *layouts/section/[CONTENT_TYPE].html* files, where `CONTENT_TYPE` matches a sub-folder inside *content*, for listing pages of any content type used in the website.

- Create a *layouts/[CONTENT_TYPE]/single.html* file, where `CONTENT_TYPE` matches a folder inside *content*, to structure and stylise each content entry of that type. You can create other files in this folder, to render content of that type differently as necessary for different sections of the website; e.g. a summary of a blog post to be listed in the listing page of all blog posts.

- *layouts/partials* contains blocks of markdown that can be reused between several other layouts; e.g. the header and footer.

### i18n

- Define the locales to be used in the website in *config.yml*:
  ```yml
  Languages:
    en:
      locale: "en-GB"
      description: "MarzeeLab's boilerplate for the Hugo static site generator, coupled with NetlifyCMS driving Github as a backend."
    pt:
      locale: "pt-PT"
      description: "Boilerplate da MarzeeLabs para o gerador de sites estáticos Hugo, integrando o NetlifyCMS para uso da plataform GitHub como backend."
  ```

- Add localized strings to be used in the website to *i18n/[LOCALE].toml* files.
  ```toml
  [Home]
  other = "Início"

  [Pages]
  other = "Páginas"

  [About]
  other = "Sobre nós"
  ```

  And use those in hugo templates:

  ```html
  <h1 class="home__title">{{ i18n "Home" | default "Home"}}</h1>
  ```

- Content entries need to be input already in the desired locale of course. Just define separate content types for each localization that is needed; see **Using Netlify CMS** below on where and how to do this:

  - Set the content type's `name` with a "-[LOCALE]" suffix:
    ```yml
    name: `blog_post-pt`
    ```

  - Make sure its `folder` is the same across locales for the same type of content.

  - Set its slug to include the locale as well, to differentiate the `.md` files for content with the same name:
    ```yml
    slug: "{{title}}.{{i18nlanguage}}"
    ```

  - Set its `filter`:
    ```yml
    filter:
      field: "i18nlanguage"
      value: "pt"
      ```

  - And finally add a hidden field to correspond to that filter, so that hugo knows what locale each content entry is written in.
    ```yml
    fields:
      - label: "Content language"
        name: "i18nlanguage"
        widget: "hidden"
        default: "en"
    ```

### Components

The joy of using our boilerplate!

React components bring together the main website and Netlify CMS's interface, by using the same components to render each content type for the webpage (using server-side rendering to provide full markup on request), and live previewing content as you edit it in the CMS interface, so you can see exactly how it will look after saving.

Check out some [code samples here and documentation](BesugoComponent.md).

- Components go in *components/SomeComponent.jsx* files; a basic folder structure similar to *layouts* is recommended for organisational purposes, although not strictly required.

- Every component must be initialized in the app entry point at *components/App.jsx*, simply import it and add it to the `initialized` array.

- Component scripts are built and processed through Babel, to allow the usage of ES6 syntax and other features in browsers that may not natively support them.

### Responsive images

During build, the script uses [sharp](https://github.com/lovell/sharp), a high performance Node.js image processing library, to create copies of several sizes of any images uploaded to the `media_folder` (see **Using Netlify CMS** below). These are an integral part of using a Responsive Design approach, to optimize traffic and page load times on different devices.

We can use *jpg* (and the *jpeg* variant), *png*, *webp* and *tiff* file types.

To take advantage of these, you must first define in *package.json* what sizes and suffixes (to be appended to the original filename) sharp should work with; e.g.:
```json
"sharp-config": {
  "src": "static/media",
  "dest": "public/media",
  "quality": 80,
  "sizes": [
    {
      "suffix": "-large",
      "width": 1400
    },
    {
      "suffix": "-regular",
      "width": 820
    },
    {
      "suffix": "-medium",
      "width": 680
    },
    {
      "suffix": "-small",
      "width": 460
    }
  ]
}
```
(Note: only change the *src*, *dest*, and *quality* if you also changed the *media_folder* value in Netlify CMS's configuration, or if you know what you're doing.)

Then to use the processed images themselves, either reference them directly in the code, or:

- import the `SrcSet` component into any other component, or use the `<SrcSet>` markup tag in the layout;

- set a *src* attribute, just like you would in any other `<img>` element, to the original file name;

- set a *sizes* attribute to tell it what sizes the image will take in the page.

The component will then build the *srcset* attribute automatically, and the image node will load the file that best fits each device conditions. Browsers that don't support this feature will simply ignore the *srcset* attribute and use the original file set in *src*.

Check out [MDN's article on Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) for more information about these attributes and how to best use them.

You can also **use responsive images in backgrounds** through the `SrcSetBg` component. Just insert it inside the element to have the background image, configure its attributes in the same way as above for `SrcSet`, and it will do its magic.

You can optionally insert `SrcSetBg` anywhere in the document and set a *bg-active-element* attribute, with a query string pointing to the element that should have the background (id, class name, etc).

### JavaScript

Most JavaScript dynamics should stay within the react components, since they're JavaScript already and know how to manage themselves.

- For any extra functionality, add any `.js` files you want in *js/site/* and they will be processed and concatenated into *public/js/main.min.js*, which you can then call from your html templates.

- Similarly, all files in *js/admin/* will be concatenated into *public/admin/main.min.js* for use in the CMS pages.

- Both of the above are processed through Babel similarly to the components scripts.

### Stylesheets

We use SASS to extend CSS and fulfill all our styling needs. Any `.scss` in the *scss* directory whose name doesn't start with an `_` will be compiled and minified into *public/css/[PATH-TO-FILE].css*.

### Static Files

All files to be copied as-is into the website go in the *static* folder.

- For example, the *admin* path is simply a *static/admin/index.html* file, that includes the remote Netlify CMS scripts as well as our own. It needs no special processing.

- Also ideal for images or other assets to be used in the website.

- Typically you would set the *uploads* directory, defined in *cms/config.yml* (see more below), somewhere in this static folder, so that any assets already uploaded will remain between builds.

## Deploy on Netlify

1. Push your Hugo project to Github

2. [Get a Netlify account](https://app.netlify.com/signup)

3. Choose your Github repository and branch, **use build command `yarn build`** and set *public/* as your Public Folder.

4. (Optional) to automatically deploy all branches and PRs to unique urls, in Netlify's control panel, go to *settings - build & deploy - continuous deployment* and set *Branch deploys* to *Deploy all branches*.

## Activate Netlify CMS

1. Set the correct repo and branch on the provided *static/admin/config.yml*

2. Create a new Github application following [Netlify's instructions](https://github.com/netlify/netlify-cms/blob/master/docs/quick-start.md) - don't forget the `https://api.netlify.com/auth/done` callback URL.

3. Go to your Netlify dashboard, select your site, navigate to Access > Authentication Providers > Install Provider > Github and use the Client ID and Secret generated in step 2.

4. Start using the CMS on **http://[your-website-url]/admin/**

**A known issue** with some setups is if you type only */admin*, the Netlify script will garble up the url, sending you to */admin#/* and the CMS errors. This is an issue with webpack (no such problem with live Netlify builds), and to avoid it, always include the trailing slash in the `/admin/` path.

## Using Netlify CMS

- Edit *cms/config.yml* to point to your project's repo and [define the content](https://www.netlifycms.org/docs/configuration-options/) to be used in the website. You may also want to change the location of the `media_folder` and `public_folder` depending on the upload needs/goals of each particular project.

- Every time content is edited or created, a new commit is pushed to the branch referenced, triggering a new build. In editorial workflow, Netlify CMS uses newly created branches and PRs to manage the various stages of a content entry, merging into the main branch when that entry is approved and published.

- Use [emoji country flags](https://emojipedia.org/flags/) in content type names to display a locale selector, to filter content types only for that locale (requires 2+ different locales).

- Avoid using special characters like `/` and `#` in branch names. Even though basic usage of Netlify CMS should still work, it has a few kinks; e.g. https://github.com/marzeelabs/besugo/issues/51/.

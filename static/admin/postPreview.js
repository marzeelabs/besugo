var PostPreview = createClass({
  render: function() {
    var entry = this.props.entry;

    var entryTitle = entry.getIn(['data', 'title']);
    var entryImage = entry.getIn(['data', 'image']) ? this.props.getAsset(entry.getIn(['data', 'image'])).toString() : '/admin/default.jpg';
    var entryBody = this.props.widgetFor('body');

    return h(
      "div",
      { id: "cmsPreview" },
      h(
        "header",
        null,
        h(
          "div",
          { "className": "navigation" },
          h(
            "div",
            { "className": "navigation__mobile-menu__toggle" },
            h("span", { "className": "navigation__mobile-menu__icon" })
          ),
          h(
            "div",
            { "className": "navigation-logo" },
            h(
              "a",
              { href: "/", "className": "navigation-logo__svg" },
              h(
                "svg",
                { "className": "navigation-logo__svg-minified" },
                h("use", { href: "#logo-main" })
              )
            )
          ),
          h(
            "ul",
            { "className": "navigation__menu" },
            h(
              "li",
              { "className": "navigation__menu-item" },
              h(
                "a",
                { "className": "navigation__menu-link", href: "/" },
                "Home"
              )
            ),
            h(
              "li",
              { "className": "navigation__menu-item" },
              h(
                "a",
                { "className": "navigation__menu-link is-hidden", href: "#" },
                " Pages"
              ),
              h(
                "ul",
                { "className": "navigation__submenu" },
                h(
                  "li",
                  { "className": "navigation__menu-item" },
                  h(
                    "a",
                    { "className": "navigation__menu-link", href: "/pages/about" },
                    "About"
                  )
                )
              )
            ),
            h(
              "li",
              { "className": "navigation__menu-item is-active" },
              h(
                "a",
                { "className": "navigation__menu-link", href: "/blog" },
                "Blog"
              )
            )
          )
        )
      ),
      h(
        "div",
        { className: "blog-post__header", style: { backgroundImage: "url(" + entryImage + ")" } },
        h(
          "div",
          { className: "blog-post__header-title__wrapper" },
          h(
            "h1",
            { className: "blog-post__header-title" },
            entryTitle
          )
        )
      ),
      h(
        "section",
        { className: "layout-container--inner" },
        entryBody
      ),
      h(
        "footer",
        { className: "footer" },
        h(
          "ul",
          { className: "footer__menu" },
          h(
            "li",
            { className: "footer__menu-item" },
            h(
              "a",
              { href: "/" },
              "home"
            )
          ),
          h(
            "li",
            { className: "footer__menu-item" },
            h(
              "a",
              { href: "/pages/about" },
              "About"
            )
          ),
          h(
            "li",
            { className: "footer__menu-item" },
            h(
              "a",
              { href: "/blog" },
              "Blog"
            )
          )
        ),
        h(
          "ul",
          { className: "footer__social-icons" },
          h(
            "li",
            { className: "footer__social-icons__item" },
            h(
              "a",
              { href: "#", target: "_blank" },
              h(
                "svg",
                null,
                h("use", { href: "#facebook-icon" })
              )
            )
          ),
          h(
            "li",
            { className: "footer__social-icons__item" },
            h(
              "a",
              { href: "#", target: "_blank" },
              h(
                "svg",
                null,
                h("use", { href: "#instagram-icon" })
              )
            )
          ),
          h(
            "li",
            { className: "footer__social-icons__item" },
            h(
              "a",
              { href: "#", target: "_blank" },
              h(
                "svg",
                null,
                h("use", { href: "#twitter-icon" })
              )
            )
          )
        ),
        h(
          "div",
          { className: "footer__copyright" },
          h(
            "a",
            { href: "/", className: "footer__copyright-logo" },
            h(
              "svg",
              null,
              h("use", { href: "#logo-main" })
            )
          ),
          h(
            "p",
            null,
            "\xA9 2017 Besugo"
          )
        )
      )
    );
  }
});

CMS.registerPreviewTemplate("blog_post", PostPreview);
CMS.registerPreviewStyle("/css/app.css");
CMS.registerPreviewStyle("https://fonts.googleapis.com/css?family=Muli:300,400,700");








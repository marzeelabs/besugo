import $ from 'jquery';
import jsyaml from 'js-yaml';

// The CMS script likes to add trailing 's's to labels, even to those that don't
// allow creating content in those collections.
// We get rid of those, it's weird to see something like "Homes" or "Footers"
// when there are only one of each.
function clearPlurals() {
  $.get('./config.yml', (data) => {
    jsyaml.safeLoad(data)
      .collections
      .forEach((collection) => {
        let selector = 'a.cms__Sidebar__viewEntriesLink[href="/#/collections/'+collection.name+'"]';
        let link = $(selector);

        // If it doesn't exist yet, we're just running this too early.
        // Remember, this is a React app, DOM isn't pre-built.
        // ToDo: an event/notification from CMS/React that the sidebar was
        // just built, so we could update the labels instantly, would be much nicer.
        if(link.length == 0) {
          let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              let target = $(mutation.target);
              link = target.find(selector);
              if(link.length == 1) {
                // If the link matches the label in a collection, we can stop observing for this collection
                // (regardless if it actually changed the label or not).
                if(checkLabel(link[0], collection)) {
                  observer.disconnect();
                  return;
                }
              }
            })
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
        else {
          checkLabel(link[0], collection);
        }
      });
  });
}

// Cleans the trailing 's' from the link label if the corresponding
// collection entry doesn't allow the creation of content in it.
//  return (bool) whether the label matches a collection.
function checkLabel(node, collection) {
  node = $(node)[0];
  if(node.text == collection.label+'s') {
    if(!collection.create) {
     node.text = collection.label;
    }
    return true;
  }
  return node.text == collection.label;
}

$(clearPlurals);

const Watch = require('../libs/Watch');

module.exports = Watch({
  spinner: 'sass',

  files: [
    'package.json',
    'scss/**/*.scss',
  ],

  tasks: [
    {
      command: 'yarn sass:scss-compile',
      text: 'compiling scss...',
    },
    {
      command: 'yarn sass:postcss',
      text: 'post-processing css...',
    },
  ],

  // Sass outputs the error inbetween the rest of the output.
  // Let's try to fetch only the error message, as that's what we're really interested in.
  onError: (err) => {
    if (err) {
      try {
        if (err.message) {
          err = err.message;
        }

        const lines = err.split('\n');
        while (lines.length > 0 && lines[0] !== '{') {
          lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1] !== '}') {
          lines.pop();
        }
        if (lines) {
          const parsed = JSON.parse(lines.join(''));
          if (parsed && 'formatted' in parsed) {
            return parsed.formatted;
          }
        }
      }
      catch (ex) {
        // Don't care.
      }
    }

    // Couldn't find the actual error lines, return the original string.
    return err;
  },
});

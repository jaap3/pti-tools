# Stich & Slice

Create drum kits for the Polyend Tracker in the browser.
Load audio files and export a perfectly sliced `.pti` file.

[![Screenshot](https://raw.githubusercontent.com/jaap3/pti-tools/main/public/images/screenshot.png)](https://jaap3.github.io/pti-tools/)

Written in Vue 3 and TypeScript.

## Development

Use [Docker Compose](https://www.docker.com/products/docker-desktop/) to run the development environment.

```bash
docker-compose build
docker-compose up
```

This will build the project and run the development server.

Once the server is up and running you can view the project in
the browser at `http://localhost:5173/`.

## Contributing

Contributions are welcome!

* Fork the repository and make a pull request.
* Create an issue to report a bug or suggest a feature.

## Reporting bugs

Make sure to include the following information when reporting bugs:

* Steps to reproduce the bug
* Expected behavior
* Actual behavior
* The version and name of the browser/operating system in use
* Screenshots/screencapture if applicable/possible

## Suggesting features

Make sure to include the following information when suggesting features:

* Description of the feature
* Expected behavior
* UI design/mockup (if applicable)

## Making a pull request

Make sure the pull request relates to an issue (bug report or feature request),
i.e. do not fix a bug or implement a feature without first creating an issue
to describe it.

Pull requests representing a minor change (e.g. fixing a typo or adding a comment)
are excempt from this rule.

All pull requests should pass linting and unit tests. There is no guarantee that
a pull request will be accepted.

## Disclaimer

This tool is not associated with Polyend. Use at your own risk.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

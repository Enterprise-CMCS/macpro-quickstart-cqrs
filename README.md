# macpro-quickstart-cqrs [![latest release](https://img.shields.io/github/release/cmsgov/macpro-quickstart-cqrs.svg)](https://github.com/cmsgov/macpro-quickstart-cqrs/releases/latest)

A serverless form submission application built and deployed to AWS with the Serverless Application Framework.


## Architecture

![Architecture Diagram](./.images/architecture.png?raw=true)

## Usage

See master build [here](https://circleci.west.cms.gov/gh/CMSgov/workflows/macpro-quickstart-cqrs/tree/master)  (Be advised:  This is currently on a CircleCI behind a VPN and EUA)


To get going with CircleCI, see the comments at the top of [.circleci/config.yml](.circleci/config.yml)


Want to deploy from your Mac?
- Create an AWS account
- Install/configure the AWS CLI
- npm install -g severless
- sh deploy.sh

Building the app locally
- todo

Running tests locally
- todo

## Requirements

NodeJS and Serverless - Get help installing both at the [Serverless Getting Started page](https://www.serverless.com/framework/docs/providers/aws/guide/installation/)

AWS Account:  You'll need an AWS account with appropriate IAM permissions (admin recommended) to build this app in Amazon.

## Dependencies

None.

## Examples
None.

## Contributing / To-Do

See current open [issues](https://github.com/mdial89f/quickstart-serverless/issues) or check out the [project board](https://github.com/mdial89f/quickstart-serverless/projects/1)

Please feel free to open new issues for defects or enhancements.

To contribute:
- Fork this repository
- Make changes in your fork
- Open a pull request targetting this repository

Pull requests are being accepted.

## License

[![License](https://img.shields.io/badge/License-CC0--1.0--Universal-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/legalcode)

See [LICENSE](LICENSE.md) for full details.

```text
As a work of the United States Government, this project is
in the public domain within the United States.

Additionally, we waive copyright and related rights in the
work worldwide through the CC0 1.0 Universal public domain dedication.
```

### Contributors

The focus for this project is the Kafka streaming platform and how applications can plug into it.  For details on the rest of the application and its services, see the upstream [macpro-quickstart-serverless](https://github.com/CMSgov/macpro-quickstart-serverless).

| [![Mike Dial][dial_avatar]][dial_homepage]<br/>[Mike Dial][dial_homepage] | [![Doug White][white_avatar]][white_homepage]<br/>[Doug White][white_homepage] | [![Berry Davenport][davenport_avatar]][davenport_homepage]<br/>[Berry Davenport][davenport_homepage] |
|---|---|---|

  [dial_homepage]: https://github.com/mdial89f
  [dial_avatar]: https://avatars.githubusercontent.com/mdial89f?size=150
  [white_homepage]: https://github.com/dwhitecl
  [white_avatar]: https://avatars.githubusercontent.com/dwhitecl?size=150
  [davenport_homepage]: https://github.com/berryd
  [davenport_avatar]: https://avatars.githubusercontent.com/berryd?size=150

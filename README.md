# THIS PROJECT IS NOW ARCHIVED, VIEW THE [NEW DATAVERSE DATA EXPLORER](https://github.com/scholarsportal/dataverse-data-explorer)

Version 2 of the Dataverse Data Explorer.

The Data Explorer is a web application which lists the variables in a tabular data file and allows users to view categories and summary statistics, see charts of the data, and conduct cross tabulation analysis.

This stand-alone component is built to complement [The Dataverse Project](https://dataverse.org). The Data Explorer is integrated as part of the dataset.xhtml and file.xhtml pages, revealing an Explore button for tabular data files upon installation.

Here's a demo of the tool in action - this should be used for testing purposes only: https://scholarsportal.github.io/dataverse-data-explorer-v2/?siteUrl=https://borealisdata.ca&fileId=8988

You can also test this tool with your own tabular files in [the Scholars Portal demo dataverse instance](https://demodv.scholarsportal.info/dataverse.xhtml). To test the tool, create your account or log in, create a dataset with tabular files (e.g. SPSS, Stata, XLSX, CSV), then click the "Explore" button in the file list after the file has been ingested by Dataverse.

## Installation

The Data Explorer V2 was created using Angular CLI version 9.
In order to generate node_modules run `npm install`.

See [the Dataverse guide for more information about installing external tools](http://guides.dataverse.org/en/latest/installation/external-tools.html).

There are three ways to run the Data Explorer V2 with Dataverse:

### GitHub Pages

The simplest way to run the Data Explorer V2 is to use GitHub Pages as the host. This is not recomended for production use, but is useful for testing the application.

To do this, download manifest json (`DataExplorer_v4.17up_github.json` or `DataExplorer_v4.20up_github.json`) to the server running Dataverse and run the following command:

#### Dataverse v4.17-v4.19

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.17up_github.json http://localhost:8080/api/admin/externalTools`

#### Dataverse v4.20 and up

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.20up_github.json http://localhost:8080/api/admin/externalTools`

### As an external application

The recommended way to install the Data Explorer is to use your own webserver. Download your npm packages with `npm install`, and then compile the Data Explorer by running `ng build --prod --base-href {URL of your application}`. The base-href value should include a trailing slash.

Copy the contents of `dataverse-data-explorer-v2/dist` into a dedicated folder on your webserver.

In the `DataExplorer_v4.17up.json` or `DataExplorer_v4.20up.json` file, add or edit the following line: `"toolUrl": "https://scholarsportal.github.io/dataverse-data-explorer-v2/"`, replacing `https://scholarsportal.github.io/dataverse-data-explorer-v2/` with the url of your webserver.

Then on your local machine that runs Dataverse execute the following command:

#### Dataverse v4.17-v4.19

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.17up.json http://localhost:8080/api/admin/externalTools`

#### Dataverse v4.20 and up

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.20up.json http://localhost:8080/api/admin/externalTools`

### Inside of the Dataverse application

Another way to use Data Explorer with Dataverse is to install it in `dataverseDirectory/src/main/webapp/ddi_explore`.

To do this, download the `dataverse-data-explorer-v2` directory, download your npm packages with `npm install`, and run `ng build --prod --base-href=ddi_explore`.

Next, copy the contents of `dataverse-data-explorer-v2/dist` into `dataverseDirectory/src/main/webapp/ddi_explore`.

Compile Dataverse and deploy it, then run the following command:

#### Dataverse v4.17-v4.19

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.17up.json http://localhost:8080/api/admin/externalTools`

#### Dataverse v4.20 and up

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.20up.json http://localhost:8080/api/admin/externalTools`

## Languages

The Data Explorer is currently available in English and French. If you would like to submit a new translation, please submit a pull request or file an issue. The language files for the application are located in `/src/assets/i18n/`

## Issues

If you encounter a bug or have a feature request, please file an issue in this repository. Pull requests are also welcome.

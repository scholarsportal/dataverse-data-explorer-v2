# dataverse-data-explorer-v2

_In development._

Version 2 of the Dataverse Data Explorer. 

## Installation

The Data Explorer V2 was created using Angular CLI version 9.
In order to generate node_modules run `npm install`.

See [the Dataverse guide for more information about installing external tools](http://guides.dataverse.org/en/latest/installation/external-tools.html).

There are three ways to run the Data Explorer V2 with Dataverse:


### Inside of the Dataverse application

Another way to use Data Curation tool with Dataverse is to install it in `dataverseDirectory/src/main/webapp/dct_explore`.

To do this, download the Dataverse-Data-Curation-Tool directory, download your npm packages with `npm install`, and run `ng build --prod --base-href=ddi_explore`.

Next, copy the contents of `dataverse-data-explorer-v2/dist` into `dataverseDirectory/src/main/webapp/ddi_explore`.

Compile Dataverse and deploy it, then run the following command:

for versions of Dataverse v4.17-v4.19

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.17up.json http://localhost:8080/api/admin/externalTools`

for versions of Dataverse v4.20 and up

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.20up.json http://localhost:8080/api/admin/externalTools`

### As an external application

The recommended way to install the Data Curation Tool is to use your own webserver. Download your npm packages with `npm install`, and then compile the Data Curation Tool by running `ng build --prod --base-href {URL of your application}`. The base-href value should include a trailing slash.

Copy the contents of `dataverse-data-explorer-v2/dist` into a dedicated folder on your webserver.

In the `DataExplorer_v4.17up.json` or `DataExplorer_v4.20up.json` file, add or edit the following line: `"toolUrl": "https://scholarsportal.github.io/dataverse-data-explorer-v2/"`, replacing `https://scholarsportal.github.io/dataverse-data-explorer-v2/` with the url of your webserver.

Then on your local machine that runs Dataverse execute the following command:

for versions of Dataverse v4.17-v4.19

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.17up.json http://localhost:8080/api/admin/externalTools`

for versions of Dataverse v4.20 and up

`curl -X POST -H 'Content-type: application/json' --upload-file DataExplorer_v4.20up.json http://localhost:8080/api/admin/externalTools`


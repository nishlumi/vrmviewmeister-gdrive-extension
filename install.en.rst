############################
Script configuration
############################

Google Slides explain everything from **setting up a script project** to **configuring it up for VRMViewMeister**.

`vrmviewmeister-gdrive-extension Install manual <https://docs.google.com/presentation/d/e/2PACX-1vQP2RstLGn82dh_FOqBfbPPBGvx9o-YQXc-3 ol8Gk4_IseKrzsgs0hgAt0h4uYX2kA71ENrnI-XXbBf/pub?start=false&loop=false&delayms=3000>`__

`vrmviewmeister-gdrive-extension Update manual <https://docs.google.com/presentation/d/e/2PACX-1vQg1nevQOWSsoUU2GsRYmvOuYiFYcUJRib3W3xCTaw-QTKo2T5OTFVrg-euPVVQKeeA9InbkdBUtFat/pub?start=false&loop=false&delayms=3000>`__

I have the script in advance in my Google drive folder. Please copy and use it.
 `share/extensions <https://drive.google.com/drive/folders/1QkWCH0GfKHIQLgbT5Ir-U-mBEKAE3AJy?usp=drive_link>`__


Create a script project
############################

If you want to use it quickly, we recommend you to copy the shared script.

If you want to set it up yourself from this repository, please refer to the following instructions. 

1. Open your Google Drive. 
2. Select GoogleAppsScript from the New button. 
3. The script editor will open. 
4. Name your project as you like. 
5. Delete the default source code and copy and paste the contents of ``apiget.js`` from this repository. 
6. Add a script by clicking the ``+`` button in the upper right corner of the file list in the editor. 
7. Name the file ``apipost.gs``, etc. 
8. Copy and paste the contents of ``apipost.js`` from this repository.
9. Repeat step 6.
10. Name the file ``library.gs``.
11. Copy and paste the contents of ``library.js`` from this repository.

Allow your account to the API
#################################

Although this project is only for your own use, you need to give permission for the script to access your Google account.

1. Select the script where you pasted the contents of ``apiget.js``.
2. Select ``setupTest`` from ``Select a function to run`` on the editor toolbar.
3. Click the Run button.
4. When you see the ``Authorization Required`` message, click ``Verify Permissions.``
5. Select your account in the login pop-up window.
6. If you see ``This app is not verified by Google``, click the ``Go to [script name]`` link at the bottom of the page.
7. The contents of your access request will be displayed.
8. Scroll to the bottom and click the ``Allow`` button.
9. The test code will run and the usage of your drive will be displayed in the log.

You are now ready to set up the actual web application.

.. warning::
   * Please make sure that the script is the one published in this repository before proceeding.

APIKEY Input
#############################

APIKEY configuration is required to use the features of this script from VRMViewMeister. This is not an official Google thing, just a rule for VRMViewMeister.

By setting a string that only you know in the form of **APIKEY** here, you can increase security so that even if the URL of your web app is leaked, it will not be executed without your permission.

1. proceed to create a script project. 
2. Click ``Project Settings`` on the left vertical toolbar. 
3. Click the ``Edit Script Properties`` button at the bottom of the page that appears. 
4. Click the ``Add Script Property`` button. 
5. When the entry field appears, enter ``APIKEY`` for the property.
6. For the value, enter any string you like. 
7. Click ``Save Script Properties``.

Next steps
===========================================

1. Open your script project. 
2. Select ``setupTest`` from the ``Select Function to Run`` toolbar in the editor. 
3. Run the script. 
4. If there is no increase or decrease in the referenced service, the script will complete execution immediately and the results will be displayed.
5. Do the steps in ``Deploy`` and ``Configure it in VRMViewMeister`` .

.. note::
   If additional scripting privileges will be added, we will let you know when the update is released.

.. caution::
   URLs issued in previous deployments will no longer be used. Please follow the steps below to stop.


Deploy
#############################

Here are the steps to publish GoogleAppsScript as a web app. 1.

1. click the ``Deploy`` button in the upper right corner of the editor screen. 
2. Click ``New Deploy``. 
3. From the ``Enable Deploy Type`` gear button, select ``Web App``.
4. In the ``Description`` field, enter text as appropriate. 
5. Set ``Run as the following user`` to ``Myself``. 
6. Set ``Accessible Users`` to ``All Users``. 
7. Click the ``Deploy`` button.

The URL of your web app will now be published.

Configure it in VRMViewMeister
################################

1. start VRMViewMeister .
2. Click ``Configure`` on the Home tab of the ribbon bar .
3. Click the ``File loader`` tab in the configuration window .
4. Enter the URL and APIKEY respectively.

VRMViewMeister will now be able to read and write data from and to the specified URL.

If you do not want VRMViewMeister to use Google Drive, leave this field blank. That is the only way to block users' access to Google Drive first.

Update the script
##################################

To update the script, open this repository or the above GoogleAppsScript script project and copy the entire source.

If you use this repository
=================================

1. open the GoogleAppsScript project on your drive
2. copy the entire contents of **apiget.js**
3. overwrite **apiget.gs**
4. Copy all the contents of **apipost.js** 
5. Overwrite **apipost.gs**
6. Copy all the contents of **library.js** 
7. Overwrite **library.gs**
8. Save the script project
9. Perform the deployment operation.

If using the original on the developer's drive
======================================================

1. Open ``vrmviewmeister-gdrive-extension`` in `share/extensions <https://drive.google.com/drive/folders/1QkWCH0GfKHIQLgbT5Ir-U-mBEKAE3AJy?usp=drive_link>`__
2. open the GoogleAppsScript project on your drive
3. copy all the contents of **apiget.gs**
4. overwrite **apiget.gs** in your script project
5. copy all the contents of **apipost.gs**
6. Overwrite **apipost.gs** in your script project 
7. copy all the contents of **library.gs**
8. Overwrite **library.gs** in your script project 
9. Save the script project
10. Perform the deployment operation.


Stopping a published URL
#############################

If VRMViewMeister no longer refers to Google Drive, or if you do not want to use it because of other concerns, you can stop it by following the steps below.

1. click the ``Deploy`` button in the upper right corner of the editor screen. 
2. Click on ``Manage Deploy``. 
3. Select the version you want to stop by clicking on it. 
4. Click ``Archive Deployment`` in the upper right corner. 
5. click the ``Archive`` button in the lower right corner when prompted for confirmation.

The URL of the target version of the web app will then be deactivated.

.. hint::
   It is recommended to delete the entire script project at the end to completely stop and remove it.
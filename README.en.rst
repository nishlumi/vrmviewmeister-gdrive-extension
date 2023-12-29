================================
vrmviewmeister-gdrive-extension
================================

Google Drive loader for VRMViewMeister
#############################################

This is the GoogleAppsScript source.

It is used by calling it from VRMViewMeister via HTTP GET/POST.
Therefore, you need to deploy GoogleAppsScript as a web app.

What we are doing on the VRMViewMeister side
================================================

It does not determine if it is actually GoogleAppsScript or not. It is only an HTTP
GET/POST arguments, Post data, and return value.

We have confirmed that it works only with web applications made by GoogleAppsScript. We do not guarantee the operation when using WebAPI created by other means.

Benefits of using GoogleAppsScript
====================================

Why not the common method of calling Google APIs in your app?
I tried an unusual attempt.

OAuth 2.0 client information and secret tokens are not aware of in the first place on the app side, so you don't have to worry about concealment, leakage, etc.
    Since the execution environment and authentication information are tied to each user, there is no information to be leaked on the app side.
    Also, the user side basically retains only the URL of the web app as unique information. And since it is a user-run script, there is a way for the user to stop it themselves.

ince it is open source, you know what you are doing.

You can trust yourself because you create the web app with your own permissions.
    | Google API apps can be used by accessing the app, logging in, and authorizing it. But you really don't know what the app is doing, no matter how officially confirmed by Google.
    | This is where GoogleAppsScript comes in.

    The source is available in this repository, so you can easily see what it is doing if you think you can read the code. Even if the code is written by someone else (the app developer), the access privileges and execution information belong to the user, so I think it is safe to use.

    Naturally, I have tried to keep the code as simple as possible to make it as easy to understand as possible.

The upper limit of execution can be kept to yourself.
    | Depending on the type of API, the limit is not so high that you should be concerned about it in normal usage. For example, Drive API can be used in abundance.
    | Usually, Google APIs have upper limits or restrictions at certain times. If a particular user uses it too much, that function may not be available until a certain amount of time has passed when the API limit is reached.

    As an app developer, you may also cringe if the app is used too often and you are charged for it.

    | If you look at it from an individual user's point of view, they will want to use it all the time without worrying about other users.
    | This is where GoogleAppsScript comes in.
    
    There are not as many limits as the API, but that script will only limit you within your own Google account.


.. admonition:: Conclusion

    * The user deploys the application himself, even if the contents of the script belong to someone else. Therefore, you can trust yourself when Google requests access.
    * And you can always decide at your own discretion whether or not to use it with VRMViewMeister.

Disadvantages of using GoogleAppsScript
========================================

The users themselves will have to deploy GoogleAppsScript as a web app.
    The first disadvantage of using Google APIs is that users only need to grant access requests from Google at any point in the use of each application.
    
    With this script, it is necessary to first operate GoogleAppsScript on Google Drive and have it prepared.
    In this regard, we also ask you to copy the GoogleAppsScript project on the drive.
    
    In addition, you will need to deploy the script to the public as a web application.
    
    Furthermore, as with the Google API, you will also need to operate the access request from Google.
    
    Finally, you will need to set the URL of the web app in VRMViewMeister.


Script configuration
=======================================

Configuration
-----------------

============= ========================== ======================
Configuration Run as the following user  Accessible users
============= ========================== ======================
Web app       Self                       **All users**
============= ========================== ======================

This allows you to browse your drive and view it in VRMViewMeister even if you are not logged in to Google on a device or devices.

.. warning::
    * **Never share your published URL with others.**
    * The URL after deploying with GoogleAppsScript is different for each version.

.. hint::
    **Security measure.**

    Set ``APIKEY`` in the script properties. Be sure to set the value yourself so that it will not be executed in case the URL of your web app is leaked.

Available features
----------------------

Enumerate files in drive
~~~~~~~~~~~~~~~~~~~~~~~~~~~

``[URL]?mode=enumdir``

Method: ``GET``

Parameter (required)

    ============ ======== ===========================
    Item name    Type     Description
    ============ ======== ===========================
    mode         String   mode name
    apikey       String   Key to execute this function
    name         String   File name to search for
    extension    String   Extension to search for
    withdata     String   Read the contents of the file as well (any value is fine)
    ============ ======== ===========================

Parameter (optional)

    ============ ======== ===========================
    Item name    Type     Description
    ============ ======== ===========================
    dirid       String   Folder ID to search
    dirname     String   Folder name to search
    ============ ======== ===========================

Return value

    The following content is in JSON format:

    ============ ======== ===========================
    Item name    Type     Description
    ============ ======== ===========================
    cd           Number   0=normal completion, 1=error
    msg          String   error message
    data         Object   Contents of the following object
    ============ ======== ===========================

    |

    ============ ======== ===========================
    Item name    Type     Description
    ============ ======== ===========================
    name         String   file name
    mimeType     String   MIME type
    id           String   File ID
    size         Number   file size
    createDate   Date     creation date
    updatedDate  Date     updated
    dir.id       String   Existing folder ID
    dir.name     String   Existing folder name
    ============ ======== ===========================


load file
~~~~~~~~~~~~~~~~~~~~~~

``[URL]?mode=load``

Method: ``GET``

parameters

    ============ ======== ===========================
    Item name    Type     Description
    ============ ======== ===========================
    mode         String   mode name
    apikey       String   Key to execute this function
    fileid       String   Drive file ID
    extension    String   file extension
    ============ ======== ===========================

Return value

    The following content is in JSON format:

    ============ ======== ===========================
    Item name    Type     Description
    ============ ======== ===========================
    cd           Number   0=normal completion, 1=error
    msg          String   error message
    name         String   file name
    size         Number   file size
    mimeType     String   MIME type
    data         Any      file data [1]_ [2]_
    ============ ======== ===========================


.. [1] For binary files, ``Byte[]``
.. [2] For files with any of the extensions json, vvmproj, vvmmot, vvmpose, ``string``

Check the last saved file
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``[URL]?mode=confirmlast``

Method: ``GET``

parameters

    ============ ======== ===========================
    Item name    Type     Description
    ============ ======== ===========================
    mode         String   mode name
    apikey       String   Key to execute this function
    fileid       String   Drive file ID
    extension    String   file extension
    ============ ======== ===========================


Return value

    The following content is in JSON format:

    ============ ======== ===========================
    Item name    Type     Description
    ============ ======== ===========================
    cd           Number   0=normal completion, 1=error
    msg          String   error message
    data         Object   Contents of the following object
    ============ ======== ===========================

    |

    ============ ======== ===========================
    Item name    Type     Description
    ============ ======== ===========================
    name         String   file name
    id           String   File ID
    size         Number   file size
    mimeType     String   MIME type
    ============ ======== ===========================


Save file as
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``[URL]?mode=saveas``

Method: ``POST``

For VRMViewMeister, the target file format is following: ``vvmproj,vvmmot,vvmpose``
Assume that the file has one of the following extensions.

parameters

    ============== ======== ===========================
    Item name      Type     Description
    ============== ======== ===========================
    mode           String   mode name
    apikey         String   Key to execute this function
    nameoverwrite  Any      Whether to overwrite with file name(1=overwrite)
    extension      String   file extension
    ============== ======== ===========================

Post body

    Content-Type is **application/json** .

    ============= ======== ===========================
    Item name     Type     Description
    ============= ======== ===========================
    name          String   file name
    id            String   File ID when overwriting and saving
    destination   String   Destination folder ID
    data          Any      File contents
    ============= ======== ===========================


Return value
    When calling a Google AppsScript web application using the fetch function, data such as JSON that should be the return value could not be returned to the caller.

    Instead, we immediately call ``mode=confirmlast`` of ``GET`` with the same file name and replace it with the return value.

Save the file
~~~~~~~~~~~~~~~~~~~~~~

``[URL]?mode=save``

Method: ``POST``

* Parameters and Post body are the same as ``mode=saveas``.


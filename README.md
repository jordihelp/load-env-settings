
# load-env-settings

load-env-settings is a zero-dependency module that loads environment variables from a `.env` file into a global variable.

## Install

```
npm install load-env-settings
```

## Usage

Create a `.env` file in the root of your project:

```
ADMIN_USER=YOUR_ADMIN_USER
SECRET_KEY=ULTRASECRETKEY
```

As early as possible in your application, import and configure the package:

```javascript
require( 'load-env-settings' ).load()
```

# load( [ settings[, nameGlobal[, allowAny ] ] ] )

- **settings**: (Object) Object with info about expected settings. If a setting included in this argument does not appear in .env file (or the file does not exist), it will be saved in the global variable with their default value. The key of each setting will be their name in the global variable. Each expected setting can contain a `env` (name of setting in .env file), a `type` (type of value of setting), a `defaultValue` (default value of setting) and a `allowEmpty` (if it is not allowed, empty settings use their default value) properties. More information in [`Settings`](#Settings). Defaults: `{}`
- **nameGlobal**: (String) The name of the global variable that save the settings. Default `AppSettings`
- **allowAny**: (Boolean) Enable any setting in .env file is allowed. If is `false`, only settings defined in `settings` will be saved in the global variable. Otherwise, the settings in .env file that are not in `settings` will be saved in the global variable with their name in .env file. Default `false`

# Settings

`settings` is an object whose elements are the data of each expected settings. The key of each setting will be their name in the global variable. 

- **[Required] env**: (Object) Name of setting in .env file.
- **type**: (String) Type of value of setting. Possible values: `string`, `integer`, `number`, `boolean`. Defaults: `string`
- **defaultValue**: (Any) Default value of setting. It can be used when setting does not exist in .env file, when the parse of value has an error or when the value of setting in .env file is empty and `allowEmpty` is `false`. Defaults: `null`
- **allowEmpty**: (Boolean) Enable values of settings in .env file can have empty string. Defaults: `false`

```javascript
{
    name_setting: {
        env: "{ Name in .env file }"
        type: "string",
        defaultValue: null,
        allowEmpty: false
    }
}
```

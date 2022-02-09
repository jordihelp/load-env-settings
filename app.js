
const fs = require( 'fs' );
const path = require( 'path' );


// Parse content of file
const _parse = ( content, settings, allowAny ) => {
    // Initialize response
    const response = {};

    // Clean file lines
    content = content.replace( /\r\n?/mg, '\n' );

    // 1st Group: Check name of setting is valid name of variable and get it
    //     ALERT: Reserved words are not checked
    //     NOTE: Fuck you, UNICODE
    // 2nd Group: Get value of setting
    const regex = /^([a-zA-Z_$][0-9a-zA-Z_$]*)=(.*)$/mg;

    let match;
    while ( ( match = regex.exec( content ) ) !== null ) {
        // Get name of setting in file
        let name = match[1];

        // Try get setting of allowed settings
        let setting = _getSetting( settings, name );

        // Only pass if setting is allowed or any settings is allowed
        if ( setting === null && !allowAny )
            continue;

        // If it exists in allowed settings, set name of setting
        // If it not exists, set settings to default
        if ( setting === null )
            setting = { ... _DefaultSetting };
        else
            name = setting.name;

        // Get value of setting in file
        const value = _getValueOfSetting( setting, match[2].trim() );

        // Set value in response
        response[ name ] = value;
    }

    return response;
}

// Default values of allowed settings
const _DefaultSetting = {
    type         : 'string',
    defaultValue : null,
    allowEmpty    : false
}

// Clean settings
const _cleanSettings = ( settings ) => {
    // Initialize cleaned settings
    let cleanedSettings = {};

    // Run settings
    Object.keys( settings ).forEach( nameSetting => {
        // Get info of setting
        const {
            env,
            type = _DefaultSetting.type,
            defaultValue = _DefaultSetting.defaultValue,
            allowEmpty = _DefaultSetting.allowEmpty
        } = settings[ nameSetting ];

        // Check if name in file exists
        if ( !env )
            return;
        
        // Set setting in settings
        cleanedSettings[ nameSetting ] = {
            name: nameSetting,
            env,
            type,
            defaultValue,
            allowEmpty
        }
    } );

    return cleanedSettings;
}

// Get info of settings from settings object
const _getSetting = ( settings, nameInFile ) => {
    // Initialize response
    let response = null;

    // Search name of file in the allowed settings
    Object.keys( settings ).forEach( nameSetting => {
        if ( settings[ nameSetting ].env === nameInFile ) {
            response = settings[ nameSetting ];
            return;
        }
    } );

    return response;
}

// Get and clean value of setting
const _getValueOfSetting = ( setting, value ) => {
    // Get info of setting
    const { type, defaultValue, allowEmpty } = setting;

    // Return default value if void values are not allowed
    if ( !allowEmpty && value.length === 0 )
        return defaultValue;

    // Return cleaned value
    switch ( type ) {
        case 'string':
        default:
            return value;
        case 'number':
            value = parseFloat( value );
            return isNaN( value ) ? defaultValue : value;
        case 'integer':
            value = parseInt( value );
            return isNaN( value ) ? defaultValue : value;
        case 'boolean':
            switch( value.toLowerCase() ) {
                case "true":
                case "yes":
                case "1":
                    return true;
                case "false":
                case "no":
                case "0":
                default:
                    return false;
            }
    }
}

// Include settings that were not in the file
const _includeSettingsNotInFile = ( settings, settingsInFile = {} ) => {
    // Initialize response
    const response = { ... settingsInFile };

    // Search settings that are not in the file
    Object.keys( settings ).forEach( nameSetting => {
        if ( !response.hasOwnProperty( nameSetting ) )
            response[ nameSetting ] = settings[ nameSetting ].defaultValue;
    } );

    return response;
}

// Load application settings from .env file
const load = ( settings = {}, nameGlobal = 'AppSettings', allowAny = false ) => {
    try {
        // Check if name of global variable already exists
        if ( global.hasOwnProperty( nameGlobal ) )
            throw new Error( `Global variable with name '${ nameGlobal }' already exists` );

        // Set path and encoding of settings
        const filepath = path.resolve( process.cwd(), '.env' );
        const encoding = 'utf-8';

        // Clean settings
        settings = _cleanSettings( settings );

        // Only read .env file if it exists and use default values otherwise
        if ( fs.existsSync( filepath ) ) {
            // By default, if there are any allowed settings, every settings is allowed
            if ( Object.keys( settings ).length === 0 )
                allowAny = true;

            // Parse content of file
            const parsedSettings = _parse( fs.readFileSync( filepath, { encoding } ), settings, allowAny );

            // Set global variable
            global[ nameGlobal ] = _includeSettingsNotInFile( settings, parsedSettings );
        } else
            // Set global variable
            global[ nameGlobal ] = _includeSettingsNotInFile( settings );

        return null;
    } catch ( error ) {
        return error;
    }
}


module.exports = {
    load
}

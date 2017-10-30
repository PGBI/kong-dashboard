var semver = require('semver');

var schemas = {
  '0.9': {
    api: {
      description: "The API object describes an API that's being exposed by Kong. Kong needs to know how to retrieve the API when a consumer is calling it from the Proxy port. Each API object must specify some combination of hosts, uris, and methods. Kong will proxy all requests to the API to the specified upstream URL.",
      documentation: 'https://getkong.org/docs/0.9.x/admin-api/#add-api',
      properties: {
        name: {
          required: false,
          type: 'string',
          description: 'The API name. If none is specified, will default to the request_host or request_path.'
        },
        request_host: {
          required: false,
          type: 'string',
          description: "The public DNS address that points to your API. For example, mockbin.com. At least request_host or request_path or both should be specified."
        },
        request_path: {
          required: false,
          type: 'string',
          description: "The public path that points to your API. For example, /someservice. At least request_host or request_path or both should be specified."
        },
        upstream_url: {
          required: true,
          type: 'string',
          description: "The base target URL that points to your API server, this URL will be used for proxying requests. For example, https://mockbin.com."
        },
        strip_request_path: {
          required: false,
          type: 'boolean',
          'default': false,
          description: "Strip the request_path value before proxying the request to the final API. For example a request made to /someservice/hello will be resolved to upstream_url/hello. By default is false."
        },
        preserve_host: {
          required: false,
          type: 'boolean',
          'default': false,
          description: "Preserves the original Host header sent by the client, instead of replacing it with the hostname of the upstream_url. By default is false."
        }
      }
    },
    consumer: {
      description: "The Consumer object represents a consumer - or a user - of an API. You can either rely on Kong as the primary datastore, or you can map the consumer list with your database to keep consistency between Kong and your existing primary datastore.",
      documentation: 'https://getkong.org/docs/0.9.x/admin-api/#create-consumer',
      properties: {
        username: {
          required: false,
          type: 'string',
          description: 'The username of the consumer. You must send either this field or custom_id with the request.'
        },
        custom_id: {
          required: false,
          type: 'string',
          description: 'Field for storing an existing ID for the consumer, useful for mapping Kong with users in your existing database. You must send either this field or username with the request.'
        }
      }
    }
  },
  '0.10': {
    api: {
      description: "The API object describes an API that's being exposed by Kong. Kong needs to know how to retrieve the API when a consumer is calling it from the Proxy port. Each API object must specify some combination of hosts, uris, and methods. Kong will proxy all requests to the API to the specified upstream URL.",
      documentation: 'https://getkong.org/docs/0.10.x/admin-api/#add-api',
      properties: {
        name: {
          required: true,
          type: 'string',
          description: 'The API name.'
        },
        hosts: {
          required: false,
          type: 'array',
          items: {
            type: 'string'
          },
          description: "A comma-separated list of domain names that point to your API. For example: example.com. At least one of hosts, uris, or methods should be specified."
        },
        uris: {
          required: false,
          type: 'array',
          items: {
            type: 'string'
          },
          description: "A comma-separated list of URIs prefixes that point to your API. For example: /my-path. At least one of hosts, uris, or methods should be specified."
        },
        methods: {
          required: false,
          type: 'array',
          items: {
            type: 'string',
            'enum': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
          },
          description: "A comma-separated list of HTTP methods that point to your API. For example: GET,POST. At least one of hosts, uris, or methods should be specified."
        },
        upstream_url: {
          required: true,
          type: 'url',
          description: "The base target URL that points to your API server. This URL will be used for proxying requests. For example: https://example.com."
        },
        strip_uri: {
          required: false,
          type: 'boolean',
          'default': true,
          description: "When matching an API via one of the uris prefixes, strip that matching prefix from the upstream URI to be requested. Default: true."
        },
        preserve_host: {
          required: false,
          type: 'boolean',
          'default': false,
          description: "When matching an API via one of the hosts domain names, make sure the request Host header is forwarded to the upstream service. By default, this is false, and the upstream Host header will be extracted from the configured upstream_url."
        },
        retries: {
          required: false,
          type: 'number',
          'default': 5,
          description: 'The number of retries to execute upon failure to proxy. The default is 5.'
        },
        upstream_connect_timeout: {
          required: false,
          type: 'number',
          'default': 60000,
          description: 'The timeout in milliseconds for establishing a connection to your upstream service. Defaults to 60000.'
        },
        upstream_send_timeout: {
          required: false,
          type: 'number',
          'default': 60000,
          description: 'The timeout in milliseconds between two successive write operations for transmitting a request to your upstream service Defaults to 60000.'
        },
        upstream_read_timeout: {
          required: false,
          type: 'number',
          'default': 60000,
          description: 'The timeout in milliseconds between two successive read operations for transmitting a request to your upstream service Defaults to 60000.'
        },
        https_only: {
          required: false,
          type: 'boolean',
          'default': false,
          description: 'To be enabled if you wish to only serve an API through HTTPS, on the appropriate port (8443 by default). Default: false.'
        },
        http_if_terminated: {
          required: false,
          type: 'boolean',
          'default': true,
          description: 'Consider the X-Forwarded-Proto header when enforcing HTTPS only traffic. Default: true.'
        }
      }
    },
    consumer: {
      description: "The Consumer object represents a consumer - or a user - of an API. You can either rely on Kong as the primary datastore, or you can map the consumer list with your database to keep consistency between Kong and your existing primary datastore.",
      documentation: 'https://getkong.org/docs/0.10.x/admin-api/#create-consumer',
      properties: {
        username: {
          required: false,
          type: 'string',
          description: 'The unique username of the consumer. You must send either this field or custom_id with the request.'
        },
        custom_id: {
          required: false,
          type: 'string',
          description: 'Field for storing an existing unique ID for the consumer - useful for mapping Kong with users in your existing database. You must send either this field or username with the request.'
        }
      }
    }
  },
  '0.11': {
    api: {
      description: "The API object describes an API that's being exposed by Kong. Kong needs to know how to retrieve the API when a consumer is calling it from the Proxy port. Each API object must specify some combination of hosts, uris, and methods. Kong will proxy all requests to the API to the specified upstream URL.",
      documentation: 'https://getkong.org/docs/0.11.x/admin-api/#add-api',
      properties: {
        name: {
          required: true,
          type: 'string',
          description: 'The API name.'
        },
        hosts: {
          required: false,
          type: 'array',
          items: {
            type: 'string'
          },
          description: "A comma-separated list of domain names that point to your API. For example: example.com. At least one of hosts, uris, or methods should be specified."
        },
        uris: {
          required: false,
          type: 'array',
          items: {
            type: 'string'
          },
          description: "A comma-separated list of URIs prefixes that point to your API. For example: /my-path. At least one of hosts, uris, or methods should be specified."
        },
        methods: {
          required: false,
          type: 'array',
          items: {
            type: 'string',
            'enum': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
          },
          description: "List of HTTP methods that point to your API. For example: GET,POST. At least one of hosts, uris, or methods should be specified."
        },
        upstream_url: {
          required: true,
          type: 'url',
          description: "The base target URL that points to your API server. This URL will be used for proxying requests. For example: https://example.com."
        },
        strip_uri: {
          required: false,
          type: 'boolean',
          'default': true,
          description: "When matching an API via one of the uris prefixes, strip that matching prefix from the upstream URI to be requested. Default: true."
        },
        preserve_host: {
          required: false,
          type: 'boolean',
          'default': false,
          description: "When matching an API via one of the hosts domain names, make sure the request Host header is forwarded to the upstream service. By default, this is false, and the upstream Host header will be extracted from the configured upstream_url."
        },
        retries: {
          required: false,
          type: 'number',
          'default': 5,
          description: 'The number of retries to execute upon failure to proxy. The default is 5.'
        },
        upstream_connect_timeout: {
          required: false,
          type: 'number',
          'default': 60000,
          description: 'The timeout in milliseconds for establishing a connection to your upstream service. Defaults to 60000.'
        },
        upstream_send_timeout: {
          required: false,
          type: 'number',
          'default': 60000,
          description: 'The timeout in milliseconds between two successive write operations for transmitting a request to your upstream service Defaults to 60000.'
        },
        upstream_read_timeout: {
          required: false,
          type: 'number',
          'default': 60000,
          description: 'The timeout in milliseconds between two successive read operations for transmitting a request to your upstream service Defaults to 60000.'
        },
        https_only: {
          required: false,
          type: 'boolean',
          'default': false,
          description: 'To be enabled if you wish to only serve an API through HTTPS, on the appropriate port (8443 by default). Default: false.'
        },
        http_if_terminated: {
          required: false,
          type: 'boolean',
          'default': true,
          description: 'Consider the X-Forwarded-Proto header when enforcing HTTPS only traffic. Default: true.'
        }
      }
    },
    consumer: {
      description: "The Consumer object represents a consumer - or a user - of an API. You can either rely on Kong as the primary datastore, or you can map the consumer list with your database to keep consistency between Kong and your existing primary datastore.",
      documentation: 'https://getkong.org/docs/0.11.x/admin-api/#create-consumer',
      properties: {
        username: {
          required: false,
          type: 'string',
          description: 'The unique username of the consumer. You must send either this field or custom_id with the request.'
        },
        custom_id: {
          required: false,
          type: 'string',
          description: 'Field for storing an existing unique ID for the consumer - useful for mapping Kong with users in your existing database. You must send either this field or username with the request.'
        }
      }
    }
  }
};

var Schema = {
  get: function(version) {
    return schemas[semver.major(version) + '.' + semver.minor(version)];
  }
};

module.exports = Schema;


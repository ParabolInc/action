import os from 'os'

export default {
  // No need to set this. Listening hostname (just for `gulp live` task).
  domain: process.env.DOMAIN || 'localhost',
  // Signaling settings (protoo WebSocket server and HTTP API server).
  http: {
    // server should listen on all IPs associated with this host
    listenIp: '0.0.0.0',
    // for local development, client should call here.
    // for deployed env, client should call another https port which should redirect here.
    listenPort: process.env.PROTOO_LISTEN_PORT || 4444
  },
  https: {
    // only needed for local development. set your own valid certificate files.
    tls: {
      cert: process.env.HTTPS_CERT_FULLCHAIN || `${__dirname}/certs/server.crt`,
      key: process.env.HTTPS_CERT_PRIVKEY || `${__dirname}/certs/server.key`
    }
  },
  // mediasoup settings.
  mediasoup: {
    // Number of mediasoup workers to launch. Careful of virtual env misleading info??
    numWorkers: Object.keys(os.cpus()).length,
    // mediasoup WorkerSettings.
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#WorkerSettings
    workerSettings: {
      logLevel: 'warn',
      logTags: [
        // give me all the infoes
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp',
        'rtx',
        'bwe',
        'score',
        'simulcast',
        'svc',
        'sctp'
      ],
      rtcMinPort: process.env.MEDIASOUP_MIN_PORT || 40000,
      rtcMaxPort: process.env.MEDIASOUP_MAX_PORT || 49999
    },
    // mediasoup Router options.
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#RouterOptions
    routerOptions: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/VP9',
          clockRate: 90000,
          parameters: {
            'profile-id': 2,
            'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '4d0032',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000
          }
        }
      ]
    },
    // mediasoup WebRtcTransport options for WebRTC endpoints (mediasoup-client,
    // libmediasoupclient).
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
    webRtcTransportOptions: {
      listenIps: [
        {
          // for docker, set this to '127.0.0.1'
          ip: process.env.MEDIASOUP_LISTEN_IP || '127.0.0.1',
          // for docker, set this to public ip address
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP
        }
      ],
      initialAvailableOutgoingBitrate: 1000000,
      minimumAvailableOutgoingBitrate: 600000,
      maxSctpMessageSize: 262144,
      // Additional options that are not part of WebRtcTransportOptions.
      maxIncomingBitrate: 1500000
    },
    // mediasoup PlainTransport options for legacy RTP endpoints (FFmpeg,
    // GStreamer).
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#PlainTransportOptions
    plainTransportOptions: {
      listenIp: {
        // for docker, set this to '0.0.0.0'
        ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
        // for docker, set this to public ip address
        announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP
      },
      maxSctpMessageSize: 262144
    }
  }
}

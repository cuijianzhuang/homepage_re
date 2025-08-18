// MetingJS 与 APlayer 配置（可按需修改）
window.APP_CONFIG = window.APP_CONFIG || {};
window.APP_CONFIG.meting = {
    // 主备 API（按顺序尝试）
    apis: [
        "https://v.iarc.top/api?server=:server&type=:type&id=:id&auth=:auth&r=:r",
        "https://api.injahow.cn/meting/?server=:server&type=:type&id=:id"
    ],
    // 数据源与资源信息
    server: "netease",
    type: "playlist",
    id: "961896580",
    // MetingJS 组件属性
    options: {
        fixed: "true",
        mini: "true",
        autoplay: "false",
        order: "random",
        volume: "0.2",
        mutex: "true",
        "storage-name": "metingjs"
    }
};

// 兼容 pages 项目风格的配置（可与上方保持同步）
window.CONFIG = window.CONFIG || {};
window.CONFIG.MUSIC = window.CONFIG.MUSIC || {};
window.CONFIG.MUSIC.METING = {
    APIS: [
        "https://v.iarc.top/api?server=:server&type=:type&id=:id&auth=:auth&r=:r",
        "https://api.injahow.cn/meting/?server=:server&type=:type&id=:id"
    ],
    SERVER: "netease",
    TYPE: "playlist",
    ID: "961896580",
    OPTIONS: {
        fixed: "true",
        mini: "true",
        autoplay: "false",
        order: "random",
        volume: "0.2",
        mutex: "true",
        "storage-name": "metingjs"
    }
};



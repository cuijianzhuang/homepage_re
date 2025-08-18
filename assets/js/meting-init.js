(function(){
    function getMetingConfig(){
        var legacy = (window.APP_CONFIG && window.APP_CONFIG.meting) || null;
        var pagesLike = (window.CONFIG && window.CONFIG.MUSIC && window.CONFIG.MUSIC.METING) || null;
        if (!legacy && !pagesLike) return null;
        if (legacy) return {
            apis: legacy.apis || [],
            server: legacy.server,
            type: legacy.type,
            id: legacy.id,
            options: legacy.options || {}
        };
        // 转换 pages 风格为内部统一结构
        return {
            apis: (pagesLike.APIS || []),
            server: pagesLike.SERVER,
            type: pagesLike.TYPE,
            id: pagesLike.ID,
            options: pagesLike.OPTIONS || {}
        };
    }

    var cfg = getMetingConfig();
    if (!cfg) return;

    function createMetingEl(apiUrl){
        var el = document.createElement('meting-js');
        el.setAttribute('server', cfg.server);
        el.setAttribute('type', cfg.type);
        el.setAttribute('id', cfg.id);
        el.setAttribute('api', apiUrl);
        var opts = cfg.options || {};
        Object.keys(opts).forEach(function(key){
            el.setAttribute(key, String(opts[key]));
        });
        return el;
    }

    function mount(el){
        document.body.appendChild(el);
    }

    // 首选使用配置里的第一个 API
    var primaryApi = (cfg.apis && cfg.apis[0]) || '';
    if (!primaryApi) return;

    var el = createMetingEl(primaryApi);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function(){ mount(el); });
    } else {
        mount(el);
    }

    // 当前播放置顶：等待 APlayer 实例就绪后绑定事件
    function whenAplayerReady(metingEl, callback){
        var maxWaitMs = 8000;
        var start = Date.now();
        (function tick(){
            if (metingEl && metingEl.aplayer) return callback(metingEl.aplayer);
            if (Date.now() - start > maxWaitMs) return; // 放弃
            requestAnimationFrame(tick);
        })();
    }

    function scrollCurrentToTop(ap){
        try {
            var root = ap.container || ap.element || (ap.template && ap.template.body) || null;
            if (!root) return;
            var list = root.querySelector && root.querySelector('.aplayer-list');
            if (!list || list.classList.contains('aplayer-list-hide')) return;
            var current = list.querySelector('li.aplayer-list-light');
            if (!current) return;
            list.scrollTop = current.offsetTop;
        } catch(e) { /* noop */ }
    }

    whenAplayerReady(el, function(ap){
        // 初次显示列表时置顶
        ['listshow', 'listswitch', 'play'].forEach(function(evt){
            try { ap.on(evt, function(){ setTimeout(function(){ scrollCurrentToTop(ap); }, 0); }); } catch(e){}
        });
        // 初始尝试
        setTimeout(function(){ scrollCurrentToTop(ap); }, 600);
    });
})();



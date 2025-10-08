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

    function scrollCurrentToBottom(ap){
        try {
            var root = ap.container || ap.element || (ap.template && ap.template.body) || null;
            if (!root) return;
            var list = root.querySelector && root.querySelector('.aplayer-list');
            if (!list || list.classList.contains('aplayer-list-hide')) return;
            var current = list.querySelector('li.aplayer-list-light');
            if (!current) return;
            // 让当前项贴近底部显示
            var target = current.offsetTop - (list.clientHeight - current.clientHeight);
            list.scrollTop = Math.max(0, target);
        } catch(e) { /* noop */ }
    }

    whenAplayerReady(el, function(ap){
        // 初次显示列表时置顶
        ['listshow', 'listswitch', 'play'].forEach(function(evt){
            try {
                ap.on(evt, function(){
                    setTimeout(function(){
                        var root = ap.container || ap.element || (ap.template && ap.template.body) || null;
                        var list = root && root.querySelector && root.querySelector('.aplayer-list');
                        if (list && list.classList.contains('scrolling-up')) {
                            scrollCurrentToTop(ap);
                        } else {
                            scrollCurrentToBottom(ap);
                        }
                    }, 0);
                });
            } catch(e){}
        });
        // 初始尝试：先按底部对齐（与默认样式一致）
        setTimeout(function(){ scrollCurrentToBottom(ap); }, 600);

        // 根据滚动方向切换“顶部/底部”吸附
        (function attachScrollDirectionWatcher(){
            try {
                var root = ap.container || ap.element || (ap.template && ap.template.body) || null;
                if (!root) return;
                var list = root.querySelector && root.querySelector('.aplayer-list');
                if (!list) {
                    // 列表可能尚未渲染，稍后再试
                    setTimeout(attachScrollDirectionWatcher, 300);
                    return;
                }
                // 记录并设置列表头部高度，便于 sticky 顶部正确避让表头
                try {
                    var header = list.querySelector('.aplayer-list-header');
                    var headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
                    list.style.setProperty('--aplayer-header-h', (headerH || 0) + 'px');
                } catch(e){}
                window.addEventListener('resize', function(){
                    try {
                        var header = list.querySelector('.aplayer-list-header');
                        var headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
                        list.style.setProperty('--aplayer-header-h', (headerH || 0) + 'px');
                    } catch(e){}
                });
                var lastTop = list.scrollTop;
                var lastDirection = 0; // -1 上, 1 下, 0 未知
                var ticking = false;
                list.addEventListener('scroll', function(){
                    if (ticking) return; // 使用 rAF 节流
                    ticking = true;
                    requestAnimationFrame(function(){
                        var currentTop = list.scrollTop;
                        if (currentTop < lastTop) {
                            // 向上滚动：固定在顶部
                            list.classList.add('scrolling-up');
                            list.classList.remove('scrolling-down');
                            if (lastDirection !== -1) {
                                // 方向由下->上，主动把当前曲目顶对齐
                                try { scrollCurrentToTop(ap); } catch(e){}
                            }
                            lastDirection = -1;
                        } else if (currentTop > lastTop) {
                            // 向下滚动：固定在底部
                            list.classList.remove('scrolling-up');
                            list.classList.add('scrolling-down');
                            if (lastDirection !== 1) {
                                // 方向由上->下，主动把当前曲目底对齐
                                try { scrollCurrentToBottom(ap); } catch(e){}
                            }
                            lastDirection = 1;
                        }
                        lastTop = currentTop;
                        ticking = false;
                    });
                });
            } catch(e) { /* noop */ }
        })();
    });
})();



// 配置信息，统一管理所有API和服务端地址
const CONFIG = {
    BING_WALLPAPER_URL: 'https://bing.img.run/rand.php', // 必应壁纸API
    BING_FALLBACK_URL: 'https://api.dujin.org/bing/1920.php', // 备用壁纸API
    HITOKOTO_API: 'https://v1.hitokoto.cn/?c=k&c=d&c=i', // 一言API
    FRIEND_LINK_API: 'https://home-push-friend-link.952780.xyz/' // 友链推送API地址
};

// 清理旧的服务工作者
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
            registration.unregister();
            console.log('已注销服务工作者:', registration);
        }
    });
}

// 性能优化：使用防抖函数
function debounce(func, delay = 300) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// 设置初始渐变背景
function setInitialBackground() {
    const gradients = [
        'linear-gradient(to right, #4568dc, #b06ab3)',
        'linear-gradient(to right, #2980b9, #6dd5fa)',
        'linear-gradient(to right, #403b4a, #e7e9bb)',
        'linear-gradient(to right, #334d50, #cbcaa5)',
        'linear-gradient(to right, #5f2c82, #49a09d)'
    ];
    
    // 随机选择一个渐变
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    
    document.body.style.backgroundImage = randomGradient;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.transition = 'background-image 1.5s ease-in-out';
}

// 获取必应每日壁纸
function getBingWallpaper() {
    // 先设置渐变背景
    setInitialBackground();
    
    const img = new Image();
    
    // 设置加载和错误处理
    img.onload = () => {
        // 使用requestAnimationFrame和setTimeout组合优化渲染性能
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.body.style.backgroundImage = `url(${img.src})`;
            }, 300); // 给渐变背景一点展示时间
        });
    };
    
    img.onerror = () => {
        console.error('获取必应壁纸失败，尝试备用API');
        tryFallbackWallpaper();
    };

    // 添加缓存破坏参数
    const timestamp = new Date().getTime();
    img.src = `${CONFIG.BING_WALLPAPER_URL}?t=${timestamp}`;
    
    // 设置超时，3秒后如果图片还未加载则尝试备用
    setTimeout(() => {
        if (!img.complete) {
            console.warn('获取必应壁纸超时，尝试备用API');
            tryFallbackWallpaper();
        }
    }, 3000);
}

// 尝试使用备用壁纸API
function tryFallbackWallpaper() {
    const backupImg = new Image();
    
    backupImg.onload = () => {
        requestAnimationFrame(() => {
            document.body.style.backgroundImage = `url(${backupImg.src})`;
        });
    };
    
    backupImg.onerror = () => {
        console.error('备用壁纸API也失败，保留渐变背景');
    };
    
    const timestamp = new Date().getTime();
    backupImg.src = `${CONFIG.BING_FALLBACK_URL}?t=${timestamp}`;
    
    // 设置超时
    setTimeout(() => {
        if (!backupImg.complete) {
            console.warn('备用壁纸API超时，保留渐变背景');
        }
    }, 2000);
}

// 已删除未使用的setBackground函数

// 获取一言
async function getHitokoto() {
    try {
        // 创建一个超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时
        
        // 使用fetch请求一言API
        const response = await fetch(CONFIG.HITOKOTO_API, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 添加淡入效果
        const hitokotoText = document.querySelector('.hitokoto-text');
        const hitokotoFrom = document.querySelector('.hitokoto-from');
        
        // 设置透明度为0
        hitokotoText.style.opacity = '0';
        hitokotoFrom.style.opacity = '0';
        
        // 更新文本内容 - 使用API返回的数据
        hitokotoText.textContent = data.hitokoto;
        hitokotoFrom.textContent = `- [${data.from}]`;
        
        // 使用setTimeout实现淡入效果
        setTimeout(() => {
            hitokotoText.style.transition = 'opacity 0.8s ease';
            hitokotoFrom.style.transition = 'opacity 0.8s ease';
            hitokotoText.style.opacity = '1';
            hitokotoFrom.style.opacity = '1';
        }, 100);
        
    } catch (error) {
        console.error('获取一言失败:', error);
        fallbackHitokoto();
    }
}

// 一言API失败时的备用显示
function fallbackHitokoto() {
    // 备用一言数组
    const fallbackQuotes = [
        { text: '一个人之所以幸福,并不是他得天独厚,只是那个人心想着幸福,为忘记痛苦而努力,为变得幸福而努力。', from: '每日一言' },
        { text: '哪有什么岁月静好，不过是有人在替你负重前行。', from: '网络' },
        { text: '生活不是等待暴风雨过去，而是学会在雨中跳舞。', from: '网络' },
        { text: '每一个不曾起舞的日子，都是对生命的辜负。', from: '尼采' },
        { text: '人生就像一场旅行，不必在乎目的地，在乎的是沿途的风景以及看风景的心情。', from: '网络' }
    ];
    
    // 随机选择一个备用一言
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    
    document.querySelector('.hitokoto-text').textContent = randomQuote.text;
    document.querySelector('.hitokoto-from').textContent = `- [${randomQuote.from}]`;
}

// 已删除未使用的formatDate函数



// 页面加载后主入口
// 包含：自动设置年份、返回按钮处理、表单处理、导航高亮等

document.addEventListener('DOMContentLoaded', function() {
    // 并行加载资源
    Promise.all([
        new Promise(resolve => {
            getBingWallpaper();
            resolve();
        }),
        getHitokoto()
    ]).catch(err => console.error('资源加载错误:', err));

    // 自动设置年份
    var yearSpan = document.getElementById('current-year');
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 统一处理所有返回按钮，点击后清空hash，返回主页
    document.querySelectorAll('.back-btn').forEach(function(btn){
        btn.addEventListener('click', function(e){
            e.preventDefault();
            window.location.hash = '';
        });
    });

    // 设置当前活动的导航项
    setActiveNavItem();

    // 监听hash变化
    window.addEventListener('hashchange', setActiveNavItem);


    
    // 添加窗口大小变化监听，使用防抖优化性能
    window.addEventListener('resize', debounce(() => {
        // 可以在这里添加响应窗口大小变化的逻辑
    }, 200));
    
    // 不再定期更新一言，仅在页面刷新时获取新内容
    
    // 优化加载动画移除时机
    const removeLoading = () => {
        const loadingElement = document.getElementById('global-loading');
        if (loadingElement) {
            loadingElement.classList.add('hide');
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 300);
        }
    };

    // 检查字体加载状态
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            setTimeout(removeLoading, 200);
        });
    } else {
        // 备用方案：固定时间后移除
        setTimeout(removeLoading, 800);
    }

    // 友链表单提交处理
    var form = document.getElementById('friend-link-form');
    if(form) {
        form.onsubmit = async function(e) {
            e.preventDefault();
            let logo = form.logo.value.trim();
            const url = form.url.value.trim();
            // 自动获取favicon，主接口+备用接口
            function getFaviconUrls(domain) {
                return [
                    `https://www.faviconextractor.com/favicon/${domain}`,
                    `https://api.iowen.cn/favicon/${domain}.png`
                ];
            }
            if (!logo) {
                try {
                    const u = new URL(url);
                    const domain = u.hostname;
                    // 默认用主接口
                    logo = getFaviconUrls(domain)[0];
                } catch {
                    logo = '';
                }
            }
            const data = {
                name: form.name.value,
                url: url,
                logo: logo,
                desc: form.desc.value,
                pushType: form.pushType.value
            };
            try {
                await fetch(CONFIG.FRIEND_LINK_API, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                document.getElementById('friend-link-result').textContent = '感谢您的提交！我们会尽快审核。';
                form.reset();
            } catch {
                document.getElementById('friend-link-result').textContent = '提交失败，请稍后重试。';
            }
        };
    }

    // 自动播放APlayer音乐（需用户首次交互后）
    function tryPlay() {
        var meting = document.querySelector('meting-js');
        if (meting && meting.aplayer && meting.aplayer.audio && meting.aplayer.audio.paused) {
            meting.aplayer.audio.play();
        }
        document.removeEventListener('click', tryPlay);
        document.removeEventListener('touchstart', tryPlay);
    }
    document.addEventListener('click', tryPlay);
    document.addEventListener('touchstart', tryPlay);
});

// 从 index.html 移动过来的函数
// 设置当前活动的导航项
function setActiveNavItem() {
    const navItems = document.querySelectorAll('.nav-item');
    const hash = window.location.hash;

    // 移除所有active类
    navItems.forEach(item => item.classList.remove('active'));

    // 根据当前hash设置active类
    if (hash) {
        const activeItem = document.querySelector(`.nav-item[href="${hash}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
    // 如果没有hash，则不设置任何活动项
}

document.addEventListener('click', function(e) {
  // 排除按钮、链接、输入框等交互元素
  if (
    e.target.closest('a, button, input, textarea, select, .back-btn, .nav-item')
  ) return;

  const ripple = document.createElement('div');
  ripple.className = 'ripple-effect';
  const size = 120;
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - size / 2) + 'px';
  ripple.style.top = (e.clientY - size / 2) + 'px';
  document.body.appendChild(ripple);

  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
});

// 预加载音效
const soundBlank = new Audio('/assets/sounds/click-blank.wav');
const soundBtn = new Audio('/assets/sounds/click-btn.wav');
const soundBack = new Audio('/assets/sounds/click-back.wav');

function playSound(audio) {
  audio.pause();
  audio.currentTime = 0;
  audio.play();
}

document.addEventListener('click', function(e) {
  // 返回键
  if (e.target.closest('.back-btn')) {
    playSound(soundBack);
    return;
  }
  // 按钮、导航
  if (e.target.closest('a, button, .nav-item')) {
    playSound(soundBtn);
    return;
  }
  // 空白处
  playSound(soundBlank);
});
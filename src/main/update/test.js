/*
const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const exec = require('child_process').exec;
const readLine = require('readline');
const baseUrl = 'http://localhost/update/electron/';
const version = '0.2.2';
const arch = 'x64';
const os = require('os');
console.log(os.arch());
const publicKey = fs.readFileSync('../.ssh/server.pub').toString();
/!*todo 根据版本号获取对称密钥*!/
// console.log(path.join(baseUrl, `v${version}`, `hashMap-v${version}-${os}.txt`));
// console.log('http:/localhost/update/electron/v0.2.2/hashMap-v0.2.2-win.txt');
//对称解密
const aesDecrypt = (encrypted, key) => {
    const decipher = crypto.createDecipher('aes192', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
new Promise((resolve, reject) => {
    /!*获取版本对称密钥*!/
    http.get('http://localhost/update/electron/v0.2.2/key-v0.2.2', res => res.on('data', chucks => resolve(crypto.publicDecrypt(publicKey, Buffer.from(chucks)))));
}).then(pwd => {
    console.log(pwd);
    return new Promise((resolve, reject) => {
        http.get('http://localhost/update/electron/v0.2.2/hashMap-v0.2.2-win.txt', res => {
            const ws = fs.createWriteStream('./s');
            const rl = readLine.createInterface({
                input: res,
                crlfDelay: Infinity
            });
            rl.on('line', line => ws.write(`${decodeURI(aesDecrypt(line, pwd))}\n`));
            rl.on('close', () => ws.end(() => resolve()));
        })
    });
});

*/

let arr = [{"path": "\\api-ms-win-core-console-l1-1-0.dll>aabbb38c4110cc0bf7203a567734a7e7"}, {"path": "\\api-ms-win-core-datetime-l1-1-0.dll>8894176af3ea65a09ae5cf4c0e6ff50f"}, {"path": "\\api-ms-win-core-debug-l1-1-0.dll>879920c7fa905036856bcb10875121d9"}, {"path": "\\api-ms-win-core-errorhandling-l1-1-0.dll>d91bf81cf5178d47d1a588b0df98eb24"}, {"path": "\\api-ms-win-core-file-l1-1-0.dll>eefe86b5a3ab256beed8621a05210df2"}, {"path": "\\api-ms-win-core-file-l1-2-0.dll>79ee4a2fcbe24e9a65106de834ccda4a"}, {"path": "\\api-ms-win-core-file-l2-1-0.dll>3f224766fe9b090333fdb43d5a22f9ea"}, {"path": "\\api-ms-win-core-handle-l1-1-0.dll>18fd51821d0a6f3e94e3fa71db6de3af"}, {"path": "\\api-ms-win-core-heap-l1-1-0.dll>ff8026dab5d3dabca8f72b6fa7d258fa"}, {"path": "\\api-ms-win-core-interlocked-l1-1-0.dll>cfe87d58f973daeda4ee7d2cf4ae521d"}, {"path": "\\api-ms-win-core-libraryloader-l1-1-0.dll>0c48220a4485f36feed84ef5dd0a5e9c"}, {"path": "\\api-ms-win-core-localization-l1-2-0.dll>23bd405a6cfd1e38c74c5150eec28d0a"}, {"path": "\\api-ms-win-core-memory-l1-1-0.dll>3940167ffb4383992e73f9a10e4b8b1e"}, {"path": "\\api-ms-win-core-namedpipe-l1-1-0.dll>990ac84ae2d83eeb532a28fe29602827"}, {"path": "\\api-ms-win-core-processenvironment-l1-1-0.dll>0c700b07c3497df4863c3f2fe37cd526"}, {"path": "\\api-ms-win-core-processthreads-l1-1-0.dll>1dda9cb13449ce2c6bb670598fc09dc8"}, {"path": "\\api-ms-win-core-processthreads-l1-1-1.dll>95c5b49af7f2c7d3cd0bc14b1e9efacb"}, {"path": "\\api-ms-win-core-profile-l1-1-0.dll>cedefd460bc1e36ae111668f3b658052"}, {"path": "\\api-ms-win-core-rtlsupport-l1-1-0.dll>65fc0b6c2ceff31336983e33b84a9313"}, {"path": "\\api-ms-win-core-string-l1-1-0.dll>e7a266dd3a2a1e03d8716f92bede582d"}, {"path": "\\api-ms-win-core-synch-l1-1-0.dll>c1dcdb0fabc8ae671a7c7a94f42fb79a"}, {"path": "\\api-ms-win-core-synch-l1-2-0.dll>6e704280d632c2f8f2cadefcae25ad85"}, {"path": "\\api-ms-win-core-sysinfo-l1-1-0.dll>887995a73bc7dde7b764afabce57efe7"}, {"path": "\\api-ms-win-core-timezone-l1-1-0.dll>c9a55de62e53d747c5a7fddedef874f9"}, {"path": "\\api-ms-win-core-util-l1-1-0.dll>29e1922b32e5312a948e6d8b1b34e2d9"}, {"path": "\\API-MS-Win-core-xstate-l2-1-0.dll>9e683825eae3b6375cbd63623196be96"}, {"path": "\\api-ms-win-crt-conio-l1-1-0.dll>a668c5ee307457729203ae00edebb6b3"}, {"path": "\\api-ms-win-crt-convert-l1-1-0.dll>9ddea3cc96e0fdd3443cc60d649931b3"}, {"path": "\\api-ms-win-crt-environment-l1-1-0.dll>39325e5f023eb564c87d30f7e06dff23"}, {"path": "\\api-ms-win-crt-filesystem-l1-1-0.dll>228c6bbe1bce84315e4927392a3baee5"}, {"path": "\\api-ms-win-crt-heap-l1-1-0.dll>1776a2b85378b27825cf5e5a3a132d9a"}, {"path": "\\api-ms-win-crt-locale-l1-1-0.dll>034379bcea45eb99db8cdfeacbc5e281"}, {"path": "\\api-ms-win-crt-math-l1-1-0.dll>8da414c3524a869e5679c0678d1640c1"}, {"path": "\\api-ms-win-crt-multibyte-l1-1-0.dll>19d7f2d6424c98c45702489a375d9e17"}, {"path": "\\api-ms-win-crt-process-l1-1-0.dll>9d3d6f938c8672a12aea03f85d5330de"}, {"path": "\\api-ms-win-crt-runtime-l1-1-0.dll>fb0ca6cbfff46be87ad729a1c4fde138"}, {"path": "\\api-ms-win-crt-string-l1-1-0.dll>ad99c2362f64cde7756b16f9a016a60f"}, {"path": "\\api-ms-win-crt-time-l1-1-0.dll>9b79fda359a269c63dcac69b2c81caa4"}, {"path": "\\api-ms-win-crt-stdio-l1-1-0.dll>d5166ab3034f0e1aa679bfa1907e5844"}, {"path": "\\api-ms-win-crt-utility-l1-1-0.dll>70e9104e743069b573ca12a3cd87ec33"}, {"path": "\\blink_image_resources_200_percent.pak>9224336777238d8e7280611d30996f10"}, {"path": "\\content_resources_200_percent.pak>65f69bd2d8b6458d3ecf77d84d70dc1c"}, {"path": "\\libEGL.dll>5db5174c15e78a5b33bbfab87bbd8883"}, {"path": "\\locales\\am.pak>471976c84de5e089aaf908b984e13caa"}, {"path": "\\LICENSE.electron.txt>18ae84aa915a8568a4c064a2bed03211"}, {"path": "\\locales\\bg.pak>095799fc09c2959feaa948a955cd8a72"}, {"path": "\\locales\\ca.pak>53ba968093037b6389ba0600102fc563"}, {"path": "\\locales\\bn.pak>382a7a4c6978b6ef96e112f1323f3694"}, {"path": "\\locales\\ar.pak>002f24819a287b15772f98b63820ebf2"}, {"path": "\\locales\\cs.pak>6837f894bc6b6e019d84ee93da24fe75"}, {"path": "\\locales\\da.pak>33ddd87cbeef8c97883d5e0b7d20d74d"}, {"path": "\\locales\\de.pak>d9a74dd305bbf859734348ccba5f6eea"}, {"path": "\\locales\\el.pak>814d4aabf62128447b7e6d32076a8c96"}, {"path": "\\locales\\en-GB.pak>13d534d2f03c3e6be415426271f26833"}, {"path": "\\locales\\en-US.pak>538cc1045845fdbca65a588834b81429"}, {"path": "\\locales\\es-419.pak>21670afce427ba6295cc4a4398670969"}, {"path": "\\locales\\es.pak>3c2ec3872bbfef1fe24f7d24d6b7670a"}, {"path": "\\locales\\et.pak>11cbb57d8b277c7a536c2164e7f93aed"}, {"path": "\\locales\\fa.pak>7e7cb170800903fa2119e2bf2f0414b8"}, {"path": "\\locales\\fake-bidi.pak>1d54af1cd196122ea569fb6f2d5b1348"}, {"path": "\\locales\\fi.pak>47fbe3f4f8c020bf16b0d704a57c3137"}, {"path": "\\locales\\fil.pak>4c0ab0358791d466d5050b10cef79c36"}, {"path": "\\locales\\fr.pak>8d674342643b039238b8842fe500bb43"}, {"path": "\\locales\\he.pak>a8e3d057b94cb87dece24d26acc9f14f"}, {"path": "\\locales\\gu.pak>beb4dde96a30851f4793d431a7511a54"}, {"path": "\\locales\\hi.pak>97994c165d173a316396bdafe0fce2ed"}, {"path": "\\locales\\hr.pak>ef14dde47f68bb48d8e63aae4e195120"}, {"path": "\\locales\\hu.pak>912468b6e9db037737e8a48e1ee752ed"}, {"path": "\\locales\\it.pak>4774972d65f171e4b1df4262f0562804"}, {"path": "\\locales\\id.pak>4666d99d9c12fc6d651c963d4782ed3e"}, {"path": "\\locales\\ja.pak>6301a10b5bfc199d546715d92fc5458b"}, {"path": "\\locales\\kn.pak>93ccf2dcefe7c1e8153d784a85d5c86f"}, {"path": "\\locales\\lt.pak>0f7b5e5fa075afcbf4b56863df8307db"}, {"path": "\\locales\\ko.pak>f908b086da584597754e22bdc2259e5f"}, {"path": "\\locales\\lv.pak>b67029e8de21ce033a357244de830f3c"}, {"path": "\\locales\\ml.pak>bcdc92de7736d2086056caf63dcd6e9f"}, {"path": "\\locales\\ms.pak>a520f1615b77c2673dae7bfa74c82ad2"}, {"path": "\\locales\\mr.pak>a9c23a0aaec7c7ad4da15122ad189abc"}, {"path": "\\locales\\nl.pak>b23653d1aefeafd66ceb9d5c079de8dc"}, {"path": "\\locales\\nb.pak>c3457eeadc7c0d9a91cee12927bad204"}, {"path": "\\locales\\pl.pak>fe674198f22dd4b6a2d5436c299d2466"}, {"path": "\\locales\\pt-BR.pak>2ea634881a35a415c9da40e3a2dd8abf"}, {"path": "\\locales\\pt-PT.pak>2183de305adef8ca4166e29b7cfaade8"}, {"path": "\\locales\\ro.pak>d67321f43f8533d96bcdc86a66b76d5a"}, {"path": "\\locales\\ru.pak>4b8dae93b3d8e4c567c3647bc9eafb60"}, {"path": "\\locales\\sk.pak>8bc69038d8e515b2d21603530b0edcb9"}, {"path": "\\locales\\sl.pak>7a67611ccc4381f0cce31b615088aa6e"}, {"path": "\\locales\\sr.pak>ece706380193311c6c903b0e92841da3"}, {"path": "\\locales\\sv.pak>0cecfc8f898daf97c4e8e2f1fa913b4e"}, {"path": "\\locales\\sw.pak>7568021daf78e0d18db9899c9ca7fbfa"}, {"path": "\\locales\\te.pak>365189832cdf98e60e7e912a3e90e6f6"}, {"path": "\\locales\\ta.pak>e48aab6537ec567e9cedec6848e2f9b5"}, {"path": "\\locales\\th.pak>744c38a901f2462a34a5d7d62da5c21c"}, {"path": "\\locales\\tr.pak>1c835411774106f19caece7ac0881cc5"}, {"path": "\\locales\\vi.pak>a8ec22d41282e04cb43947f5590245b6"}, {"path": "\\locales\\zh-CN.pak>e47c55aa5812d529b0e12edf5e0e4b4e"}, {"path": "\\locales\\uk.pak>caf0ab04e8106060c24739017f087664"}, {"path": "\\locales\\zh-TW.pak>2fe7629347a7f573973d92ab0237fead"}, {"path": "\\views_resources_200_percent.pak>6246a3e0832895dde8ca8c3bfd798ca6"}, {"path": "\\api-ms-win-crt-private-l1-1-0.dll>3d139f57ed79d2c788e422ca26950446"}, {"path": "\\resources\\elevate.exe>792b92c8ad13c46f27c7ced0810694df"}, {"path": "\\ui_resources_200_percent.pak>4ae9c0016707a23548f9b55cb770ddc9"}, {"path": "\\vcruntime140.dll>7587bf9cb4147022cd5681b015183046"}, {"path": "\\natives_blob.bin>7f20917d39abdc8ccac48f8cce93bf09"}, {"path": "\\resources\\electron.asar>b7bad86a92506aa7af9e66ca86ff2fab"}, {"path": "\\msvcp140.dll>109f0f02fd37c84bfc7508d4227d7ed5"}, {"path": "\\ucrtbase.dll>6343ff7874ba03f78bb0dfe20b45f817"}, {"path": "\\v8_context_snapshot.bin>52eee7fdda972dc21668fa3a98bf5be6"}, {"path": "\\ffmpeg.dll>aeafe2db6ffee1bbca1976ba0ae9d4a4"}, {"path": "\\LICENSES.chromium.html>3039c56eaee9a3fc5f5afc4308677621"}, {"path": "\\resources\\app.asar>cd9984133d50d7a21e2c659116cf753a"}, {"path": "\\libGLESv2.dll>101f0fd256f39b387011dfc97090a45b"}, {"path": "\\d3dcompiler_47.dll>c5b362bce86bb0ad3149c4540201331d"}, {"path": "\\content_shell.pak>ab9992f3bef24d6ffd8e76ce56f96de5"}, {"path": "\\icudtl.dat>62ce282dfe0ab8f2a35a529faeb61ac2"}, {"path": "\\node.dll>2fe3340f93f9eb978a6f3ca77215b085"}, {"path": "\\evt1.exe>a9e98c1ca6cf8f132be18b2ef1d32d52"}, {"path": ""}]
const arr2Obj = arr => {
    const obj = {};
    arr.forEach(item => {
        console.log(item.hash);
        return obj[item.hash] ?
            obj[item.hash].push(item.path) :
            obj[item.hash] = [item.path];
    });
    return obj;
};
console.log(arr2Obj(arr));
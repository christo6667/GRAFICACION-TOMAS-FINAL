var _a;
import { Obj3D } from './Obj3D.js';
import { CvZbuf } from './CvZbuf.js';
import { Point3D } from './point3D.js';
import { chainLink0, chainLink1, chainLink2, chainLink3, chainLink4 } from './defaultModels.js';
let canvas;
let graphics;
canvas = document.getElementById('circlechart');
graphics = canvas.getContext('2d');
let cv;
let loadedObjects = [];
let backups = [];
// Kinematics states
let coilingProgress = 0;
let coilingTarget = 0;
let isCoiling = false;
// Assembly state
let visibleLinksCount = 5;
let baseRho = 1.0;
function repaintAll() {
    if (!cv)
        cv = new CvZbuf(graphics, canvas);
    cv = new CvZbuf(graphics, canvas);
    for (let i = 0; i < visibleLinksCount && i < loadedObjects.length; i++) {
        cv.addObj(loadedObjects[i]);
    }
    cv.paint();
}
function vp(dTheta, dPhi, fRho) {
    if (!cv || loadedObjects.length === 0)
        return;
    for (let obj of loadedObjects) {
        obj.vp(cv, dTheta, dPhi, fRho);
    }
}
let autoRotating = false;
let animationFrameId;
function toggleAutoRotate() {
    autoRotating = !autoRotating;
    const btn = document.getElementById('btn-auto-rotate');
    if (btn) {
        if (autoRotating) {
            btn.innerHTML = '■ DETENER';
            rotateLoop();
        }
        else {
            btn.innerHTML = '► ANIMAR';
            cancelAnimationFrame(animationFrameId);
        }
    }
}
function updateKinematics() {
    if (coilingProgress !== coilingTarget) {
        coilingProgress += (coilingTarget - coilingProgress) * 0.1;
        if (Math.abs(coilingTarget - coilingProgress) < 0.01) {
            coilingProgress = coilingTarget;
        }
        let angle = coilingProgress * (Math.PI / 2.2);
        for (let i = 0; i < loadedObjects.length; i++) {
            for (let v = 1; v < loadedObjects[i].w.length; v++) {
                let pBase = backups[i][v];
                if (!pBase)
                    continue;
                let px = pBase.x;
                let py = pBase.y;
                let pz = pBase.z;
                for (let j = i - 1; j >= 0; j--) {
                    let jx = -2.24 + j * 1.35;
                    let jy = 0;
                    let tx = px - jx;
                    let ty = py - jy;
                    let rx = tx * Math.cos(angle) - ty * Math.sin(angle);
                    let ry = tx * Math.sin(angle) + ty * Math.cos(angle);
                    px = rx + jx;
                    py = ry + jy;
                }
                loadedObjects[i].w[v].x = px;
                loadedObjects[i].w[v].y = py;
                loadedObjects[i].w[v].z = pz;
            }
        }
        vp(0, 0, 1);
    }
}
function rotateLoop() {
    if (autoRotating) {
        let dTheta = 45 * 0.0005;
        vp(dTheta, 0, 1);
    }
    updateKinematics();
    animationFrameId = requestAnimationFrame(rotateLoop);
}
(_a = document.getElementById('btn-auto-rotate')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', toggleAutoRotate, false);
canvas.addEventListener('click', () => {
    coilingTarget = coilingTarget === 0 ? 1 : 0;
    if (!autoRotating) {
        if (animationFrameId)
            cancelAnimationFrame(animationFrameId);
        rotateLoop();
    }
});
let Pix, Piy;
let Pfx, Pfy;
let flag = false;
function handleMouse(evento) {
    Pix = evento.offsetX;
    Piy = evento.offsetY;
    flag = true;
}
function makeVizualization(evento) {
    if (flag && loadedObjects.length > 0) {
        Pfx = evento.offsetX;
        Pfy = evento.offsetY;
        let difX = Pfx - Pix;
        let difY = Pfy - Piy;
        vp(-difX * 0.01, difY * 0.01, 1);
        Pix = Pfx;
        Piy = Pfy;
    }
}
function noDraw() {
    flag = false;
}
canvas.addEventListener('mousedown', handleMouse);
canvas.addEventListener('mouseup', noDraw);
canvas.addEventListener('mousemove', makeVizualization);
canvas.addEventListener('mouseleave', noDraw);
function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        if (cv)
            cv.paint();
    }
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);
let manualRotationInterval;
function startManualRotation(dTheta, dPhi, fRho = 1) {
    if (loadedObjects.length === 0)
        return;
    vp(dTheta, dPhi, fRho);
    clearInterval(manualRotationInterval);
    manualRotationInterval = window.setInterval(() => {
        vp(dTheta, dPhi, fRho);
    }, 30);
}
function stopManualRotation() {
    clearInterval(manualRotationInterval);
}
function setupDPad() {
    const btnUp = document.getElementById('btn-rot-up');
    const btnDown = document.getElementById('btn-rot-down');
    const btnLeft = document.getElementById('btn-rot-left');
    const btnRight = document.getElementById('btn-rot-right');
    const addHoldEvents = (btn, dTheta, dPhi, fRho = 1) => {
        if (!btn)
            return;
        btn.addEventListener('mousedown', () => startManualRotation(dTheta, dPhi, fRho));
        btn.addEventListener('mouseup', stopManualRotation);
        btn.addEventListener('mouseleave', stopManualRotation);
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); startManualRotation(dTheta, dPhi, fRho); });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); stopManualRotation(); });
        btn.addEventListener('touchcancel', (e) => { e.preventDefault(); stopManualRotation(); });
    };
    const rotSpeed = 0.05;
    addHoldEvents(btnUp, 0, rotSpeed);
    addHoldEvents(btnDown, 0, -rotSpeed);
    addHoldEvents(btnLeft, -rotSpeed, 0);
    addHoldEvents(btnRight, rotSpeed, 0);
}
setupDPad();
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (loadedObjects.length === 0)
        return;
    if (e.deltaY < 0) {
        vp(0, 0, 0.9);
    }
    else {
        vp(0, 0, 1.1);
    }
});
window.addEventListener('load', () => {
    cv = new CvZbuf(graphics, canvas);
    const parts = [chainLink0, chainLink1, chainLink2, chainLink3, chainLink4];
    const colors = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 150, b: 255 },
        { r: 255, g: 255, b: 0 },
        { r: 255, g: 0, b: 255 }
    ];
    let minX = 9999, maxX = -9999;
    let minY = 9999, maxY = -9999;
    let minZ = 9999, maxZ = -9999;
    parts.forEach((data, i) => {
        if (data) {
            let tempObj = new Obj3D();
            if (tempObj.read(data)) {
                tempObj.baseColorR = colors[i].r;
                tempObj.baseColorG = colors[i].g;
                tempObj.baseColorB = colors[i].b;
                loadedObjects.push(tempObj);
                if (tempObj.xMin < minX)
                    minX = tempObj.xMin;
                if (tempObj.xMax > maxX)
                    maxX = tempObj.xMax;
                if (tempObj.yMin < minY)
                    minY = tempObj.yMin;
                if (tempObj.yMax > maxY)
                    maxY = tempObj.yMax;
                if (tempObj.zMin < minZ)
                    minZ = tempObj.zMin;
                if (tempObj.zMax > maxZ)
                    maxZ = tempObj.zMax;
            }
        }
    });
    let dx = (maxX + minX) / 2.0;
    let dy = (maxY + minY) / 2.0;
    let dz = (maxZ + minZ) / 2.0;
    let sx = maxX - minX;
    let sy = maxY - minY;
    let sz = maxZ - minZ;
    baseRho = 0.6 * Math.sqrt(sx * sx + sy * sy + sz * sz);
    for (let i = 0; i < loadedObjects.length; i++) {
        let obj = loadedObjects[i];
        backups[i] = [];
        for (let v = 1; v < obj.w.length; v++) {
            if (obj.w[v]) {
                obj.w[v].x -= dx;
                obj.w[v].y -= dy;
                obj.w[v].z -= dz;
                backups[i][v] = new Point3D(obj.w[v].x, obj.w[v].y, obj.w[v].z);
            }
        }
        obj.rhoMin = baseRho;
        obj.rhoMax = 1000 * obj.rhoMin;
        obj.rho = 3.5 * obj.rhoMin;
    }
    vp(0, 0, 1);
    repaintAll();
    rotateLoop();
    // Panel Listeners
    const lightDirX = document.getElementById('light-dir-x');
    const valLightDirX = document.getElementById('val-light-dir-x');
    lightDirX === null || lightDirX === void 0 ? void 0 : lightDirX.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (valLightDirX)
            valLightDirX.innerText = val.toFixed(1);
        for (let obj of loadedObjects) {
            obj.sunX = val;
        }
        repaintAll();
    });
    const lightBright = document.getElementById('light-bright');
    const valLightBright = document.getElementById('val-light-bright');
    lightBright === null || lightBright === void 0 ? void 0 : lightBright.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (valLightBright)
            valLightBright.innerText = val.toFixed(1);
        for (let obj of loadedObjects) {
            obj.lightBright = val * 50;
        }
        repaintAll();
    });
    const lightShadow = document.getElementById('light-shadow');
    const valLightShadow = document.getElementById('val-light-shadow');
    lightShadow === null || lightShadow === void 0 ? void 0 : lightShadow.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (valLightShadow)
            valLightShadow.innerText = val.toFixed(1);
        for (let obj of loadedObjects) {
            obj.lightShadow = val;
        }
        repaintAll();
    });
    // Zoom Listener
    const camZoom = document.getElementById('cam-zoom');
    const valCamZoom = document.getElementById('val-cam-zoom');
    camZoom === null || camZoom === void 0 ? void 0 : camZoom.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (valCamZoom)
            valCamZoom.innerText = val.toFixed(1);
        for (let obj of loadedObjects) {
            obj.rho = val * baseRho;
        }
        vp(0, 0, 1);
        repaintAll();
    });
    // Assemble Button Listener
    const btnAssemble = document.getElementById('btn-assemble');
    btnAssemble === null || btnAssemble === void 0 ? void 0 : btnAssemble.addEventListener('click', () => {
        visibleLinksCount = 1;
        repaintAll();
        let assemblyInterval = setInterval(() => {
            visibleLinksCount++;
            repaintAll();
            if (visibleLinksCount >= 5) {
                clearInterval(assemblyInterval);
            }
        }, 600); // add a new link every 600ms
    });
    // File loaders
    function leerArchivoGenerico(e, isBase) {
        let archivo = e.target.files[0];
        if (!archivo)
            return;
        let lector = new FileReader();
        lector.onload = function (e) {
            let contenido = e.target.result;
            let tempObj = new Obj3D();
            if (tempObj.read(contenido)) {
                if (isBase) {
                    loadedObjects = [tempObj];
                    backups = [];
                    // Setup backup for the single object
                    backups[0] = [];
                    for (let v = 1; v < tempObj.w.length; v++) {
                        if (tempObj.w[v])
                            backups[0][v] = new Point3D(tempObj.w[v].x, tempObj.w[v].y, tempObj.w[v].z);
                    }
                    let sx = tempObj.xMax - tempObj.xMin;
                    let sy = tempObj.yMax - tempObj.yMin;
                    let sz = tempObj.zMax - tempObj.zMin;
                    baseRho = 0.6 * Math.sqrt(sx * sx + sy * sy + sz * sz);
                    tempObj.rhoMin = baseRho;
                    tempObj.rhoMax = 1000 * tempObj.rhoMin;
                    tempObj.rho = 3.5 * tempObj.rhoMin;
                    visibleLinksCount = 1;
                    const lbl = document.getElementById('file-name-base');
                    if (lbl)
                        lbl.innerText = archivo.name;
                }
                else {
                    // Append to assembly
                    let i = loadedObjects.length;
                    loadedObjects.push(tempObj);
                    backups[i] = [];
                    for (let v = 1; v < tempObj.w.length; v++) {
                        if (tempObj.w[v])
                            backups[i][v] = new Point3D(tempObj.w[v].x, tempObj.w[v].y, tempObj.w[v].z);
                    }
                    tempObj.rhoMin = baseRho;
                    tempObj.rhoMax = 1000 * tempObj.rhoMin;
                    tempObj.rho = 3.5 * tempObj.rhoMin;
                    visibleLinksCount = loadedObjects.length;
                    const lbl = document.getElementById('file-name-movil');
                    if (lbl)
                        lbl.innerText = archivo.name;
                }
                vp(0, 0, 1);
                repaintAll();
            }
        };
        lector.readAsText(archivo);
    }
    const fileBase = document.getElementById('file-input-base');
    fileBase === null || fileBase === void 0 ? void 0 : fileBase.addEventListener('change', (e) => leerArchivoGenerico(e, true), false);
    const fileMovil = document.getElementById('file-input-movil');
    fileMovil === null || fileMovil === void 0 ? void 0 : fileMovil.addEventListener('change', (e) => leerArchivoGenerico(e, false), false);
});

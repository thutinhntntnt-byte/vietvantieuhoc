import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';

interface ThreeDHamburgerProps {
  currentStep: 'intro' | 'body' | 'conclusion' | 'complete';
}

const ThreeDHamburger: React.FC<ThreeDHamburgerProps> = ({ currentStep }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Transparent background

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 6, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, false);
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 10;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(2, 4, 2), scene);
    pointLight.intensity = 0.5;

    // Materials
    const bunMat = new BABYLON.StandardMaterial("bunMat", scene);
    bunMat.diffuseColor = new BABYLON.Color3(0.85, 0.6, 0.3);
    
    const meatMat = new BABYLON.StandardMaterial("meatMat", scene);
    meatMat.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);

    const lettuceMat = new BABYLON.StandardMaterial("lettuceMat", scene);
    lettuceMat.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);

    const tomatoMat = new BABYLON.StandardMaterial("tomatoMat", scene);
    tomatoMat.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);

    // Create Layers
    const topBun = BABYLON.MeshBuilder.CreateSphere("topBun", { diameterX: 3, diameterY: 1.2, diameterZ: 3 }, scene);
    topBun.position.y = 1.2;
    topBun.material = bunMat;

    const lettuce = BABYLON.MeshBuilder.CreateCylinder("lettuce", { diameter: 3.2, height: 0.1 }, scene);
    lettuce.position.y = 0.5;
    lettuce.material = lettuceMat;

    const tomato = BABYLON.MeshBuilder.CreateCylinder("tomato", { diameter: 2.8, height: 0.2 }, scene);
    tomato.position.y = 0.3;
    tomato.material = tomatoMat;

    const meat = BABYLON.MeshBuilder.CreateCylinder("meat", { diameter: 3, height: 0.4 }, scene);
    meat.position.y = -0.1;
    meat.material = meatMat;

    const bottomBun = BABYLON.MeshBuilder.CreateCylinder("bottomBun", { diameter: 3, height: 0.6 }, scene);
    bottomBun.position.y = -0.7;
    bottomBun.material = bunMat;

    // Animation / Highlighting logic
    scene.registerBeforeRender(() => {
      topBun.rotation.y += 0.01;
      lettuce.rotation.y += 0.01;
      tomato.rotation.y += 0.01;
      meat.rotation.y += 0.01;
      bottomBun.rotation.y += 0.01;

      // Reset scales
      [topBun, lettuce, tomato, meat, bottomBun].forEach(m => m.scaling = new BABYLON.Vector3(1, 1, 1));

      // Highlight logic
      if (currentStep === 'intro') {
        topBun.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);
      } else if (currentStep === 'body') {
        lettuce.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);
        tomato.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);
        meat.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);
      } else if (currentStep === 'conclusion') {
        bottomBun.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);
      }
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, [currentStep]);

  return <canvas ref={canvasRef} className="w-full h-48 outline-none touch-none" />;
};

export default ThreeDHamburger;
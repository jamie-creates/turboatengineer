/* oxlint-disable react/react-compiler -- Effect creates an imperative WebGL renderer and reports graphics initialization failures. */
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- WebGL canvas cannot be replaced with an img element. */
'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  Color3,
  Color4,
  HemisphericLight,
  DirectionalLight,
  MeshBuilder,
  Mesh,
  VertexData,
  StandardMaterial,
  TransformNode,
  ShaderMaterial,
  Matrix,
} from '@babylonjs/core';
import { materials, stats, type Design, type runEvent } from '@/lib/game';
export default function BoatScene({
  design,
  running,
  waves,
  entrants,
  progress,
}: {
  design: Design;
  running: boolean;
  waves: number;
  entrants: ReturnType<typeof runEvent> | null;
  progress: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    live = useRef({ running, waves, progress });
  const renderer = useRef<Engine | null>(null);
  useEffect(() => () => {
    renderer.current?.dispose();
    renderer.current = null;
  }, []);
  useEffect(() => {
    live.current = { running, waves, progress };
  }, [running, waves, progress]);
  const cameraState = useRef({
    alpha: -Math.PI * 0.66,
    beta: Math.PI * 0.32,
    radius: 10,
  });
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!canvas.current) return;
    let engine: Engine | undefined;
    try {
      engine = renderer.current ?? new Engine(canvas.current, true, {
        preserveDrawingBuffer: false,
        stencil: false,
      });
      renderer.current = engine;
      engine.setHardwareScalingLevel(
        Math.max(1, (window.devicePixelRatio || 1) / 1.5),
      );
      const scene = new Scene(engine);
      scene.clearColor = new Color4(0.065, 0.18, 0.23, 1);
      scene.fogMode = Scene.FOGMODE_EXP2;
      scene.fogDensity = 0.018;
      scene.fogColor = new Color3(0.065, 0.18, 0.23);
      const camera = new ArcRotateCamera(
        'camera',
        cameraState.current.alpha,
        cameraState.current.beta,
        cameraState.current.radius,
        Vector3.Zero(),
        scene,
      );
      camera.attachControl(canvas.current, true);
      camera.lowerRadiusLimit = 6;
      camera.upperRadiusLimit = 18;
      camera.lowerBetaLimit = 0.2;
      camera.upperBetaLimit = 1.5;
      camera.panningSensibility = 0;
      camera.wheelPrecision = 40;
      new HemisphericLight('sky', new Vector3(0, 1, 0), scene).intensity = 1.1;
      new DirectionalLight('sun', new Vector3(-1, -2, 1), scene).intensity =
        1.2;
      const mat = (name: string, color: string) => {
        const m = new StandardMaterial(name, scene);
        m.diffuseColor = Color3.FromHexString(color);
        m.specularColor = new Color3(0.2, 0.3, 0.3);
        m.backFaceCulling = false;
        return m;
      };
      const mats = materials.map((m) => mat(m.name, m.color)),
        dark = mat('engine', '#24323a'),
        brace = mat('cross braces', '#9cabb0');
      mats.forEach((m) => (m.specularPower = 10 + design.finish));
      const boats = [
        design,
        ...(entrants?.opponents.map((o) => o.design) || []),
      ];
      const water = MeshBuilder.CreateGround(
        'water',
        { width: 160, height: 160 },
        scene,
      );
      water.position.y = -0.34;
      const declarations = boats
        .map(
          (_, i) =>
            'uniform mat4 inverseBoat' +
            i +
            ';uniform float widths' +
            i +
            '[5];uniform float depths' +
            i +
            '[5];uniform float ratio' +
            i +
            ';uniform float sealed' +
            i +
            ';',
        )
        .join('');
      const masks = boats
        .map(
          (_, i) =>
            '{vec3 p=(inverseBoat' +
            i +
            '*vec4(worldPos,1.0)).xyz;float z=2.5-p.z;float halfWidth=0.0;float depth=0.0;for(int j=0;j<5;j++){float f=float(j);if(z>=f&&z<=f+1.0){float t=z-f;float prevW=0.0;float prevD=0.0;if(j>0){prevW=widths' +
            i +
            '[j-1];prevD=depths' +
            i +
            '[j-1];}halfWidth=mix(prevW,widths' +
            i +
            '[j],t);depth=mix(prevD,depths' +
            i +
            '[j],t);}}float fraction=clamp((p.y-(0.4-depth))/max(depth,0.01),0.0,1.0);float innerWidth=halfWidth*mix(ratio' +
            i +
            ',1.0,fraction);if(sealed' +
            i +
            '>0.5&&z>0.0&&z<5.0&&p.y<0.4&&p.y>0.4-depth&&abs(p.x)<innerWidth)discard;}',
        )
        .join('');
      const waterMat = new ShaderMaterial(
        'dry hull water',
        scene,
        {
          vertexSource:
            'precision highp float;attribute vec3 position;uniform mat4 world;uniform mat4 worldViewProjection;varying vec3 worldPos;void main(){worldPos=(world*vec4(position,1.0)).xyz;gl_Position=worldViewProjection*vec4(position,1.0);}',
          fragmentSource:
            'precision highp float;varying vec3 worldPos;' +
            declarations +
            'void main(){' +
            masks +
            'float ripple=sin(worldPos.x*2.0+worldPos.z*3.0)*0.008;gl_FragColor=vec4(vec3(0.105,0.34,0.41)+ripple,1.0);}',
        },
        {
          attributes: ['position'],
          uniforms: [
            'world',
            'worldViewProjection',
            ...boats.flatMap((_, i) => [
              'inverseBoat' + i,
              'widths' + i,
              'depths' + i,
              'ratio' + i,
              'sealed' + i,
            ]),
          ],
        },
      );
      boats.forEach((d, i) => {
        waterMat.setFloats(
          'widths' + i,
          d.widths.map((w) => w / 100),
        );
        waterMat.setFloats('depths' + i, d.depths);
        waterMat.setFloat('ratio' + i, d.hull === 'v' ? 0.04 : 0.45);
      });
      water.material = waterMat;
      function createBoat(design: Design, name: string) {
        const paint = mat(name + ' paint', design.color);
        paint.zOffset = -1;
        const root = new TransformNode(name, scene),
          ratio = design.hull === 'v' ? 0.04 : 0.45;
        function section(row: number) {
          if (row < 0)
            return Array.from({ length: 4 }, () => new Vector3(0, 0.4, 2.5));
          const half = design.widths[row] / 100,
            depth = design.depths[row],
            z = 1.5 - row;
          return [
            new Vector3(-half, 0.4, z),
            new Vector3(-half * ratio, 0.4 - depth, z),
            new Vector3(half * ratio, 0.4 - depth, z),
            new Vector3(half, 0.4, z),
          ];
        }
        function patch(name: string, points: Vector3[], m: StandardMaterial) {
          const mesh = new Mesh(name, scene),
            data = new VertexData();
          data.positions = points.flatMap((p) => [p.x, p.y, p.z]);
          data.indices = [0, 1, 2, 0, 2, 3];
          const normals: number[] = [];
          VertexData.ComputeNormals(data.positions, data.indices, normals);
          data.normals = normals;
          data.applyToMesh(mesh);
          mesh.material = m;
          mesh.parent = root;
          return mesh;
        }
        function beamBetween(name: string, a: Vector3, b: Vector3, r = 0.025) {
          const line = MeshBuilder.CreateTube(
            name,
            { path: [a, b], radius: r, tessellation: 6 },
            scene,
          );
          line.parent = root;
          line.material = brace;
          return line;
        }
        for (let row = 0; row < 5; row++) {
          const front = section(row - 1),
            back = section(row);
          for (let col = 0; col < 3; col++) {
            const slot = row === 0 ? 1 : row * 3 + col,
              p = design.panels[slot];
            if (p) {
              patch(
                'panel ' + (slot + 1),
                [front[col], back[col], back[col + 1], front[col + 1]],
                mats[p.material],
              );
              if (p.braced)
                beamBetween('panel brace', front[col], back[col + 1]);
              if (col !== 1) {
                const edge = col === 0 ? 0 : 3;
                const bottom = col === 0 ? 1 : 2;
                patch('painted sheer stripe', [
                  front[edge], back[edge],
                  Vector3.Lerp(back[edge], back[bottom], 0.28),
                  Vector3.Lerp(front[edge], front[bottom], 0.28),
                ], paint);
              }
            }
          }
          beamBetween('station frame', back[0], back[1], 0.014);
          beamBetween('station frame', back[1], back[2], 0.014);
          beamBetween('station frame', back[2], back[3], 0.014);
          for (const edge of [0, 3]) {
            const rail = beamBetween('gunwale', front[edge], back[edge], 0.025);
            rail.material = paint;
          }
        }
        const stern = section(4);
        patch(
          'transom',
          [stern[0], stern[1], stern[2], stern[3]],
          mats[design.sternMaterial],
        );
        function box(
          name: string,
          w: number,
          h: number,
          d: number,
          x: number,
          y: number,
          z: number,
          m: StandardMaterial,
        ) {
          const b = MeshBuilder.CreateBox(
            name,
            { width: w, height: h, depth: d },
            scene,
          );
          b.parent = root;
          b.position.set(x, y, z);
          b.material = m;
          return b;
        }
        for (const row of [2, 3])
          box(
            'seat shell',
            (design.widths[row] / 100) * 1.65,
            0.13,
            0.32,
            0,
            0.31,
            1.5 - row,
            mats[design.seatMaterial],
          );
        const motorRow = Math.floor(design.engineSlot / 3),
          motorX =
            (((design.engineSlot % 3) - 1) * design.widths[motorRow]) / 150;
        box(
          'engine',
          0.35 + design.engine * 0.08,
          0.48,
          0.45,
          motorX,
          0.5,
          2 - motorRow,
          dark,
        );
        const pipe = MeshBuilder.CreateCylinder(
          'exhaust',
          { height: 0.55, diameter: 0.06, tessellation: 8 },
          scene,
        );
        pipe.parent = root;
        pipe.position.set(motorX + 0.23, 0.48, 2 - motorRow);
        pipe.material = brace;
        return root;
      }
      const roots = boats.map((d, i) =>
          createBoat(
            d,
            i === 0 ? 'Your boat' : entrants!.opponents[i - 1].name,
          ),
        ),
        root = roots[0];
      if (boats.length > 1) {
        camera.radius = Math.max(camera.radius, 17);
        camera.target.x = (boats.length - 1) * 1.5;
      }
      const foam = mat('foam', '#78bdc5');
      foam.alpha = 0.4;
      const ripples = Array.from({ length: 54 }, (_, i) => {
        const b = MeshBuilder.CreateBox(
          'ripple',
          { width: 0.3 + (i % 5) * 0.23, height: 0.01, depth: 0.028 },
          scene,
        );
        b.position.set(((i * 7) % 29) - 14, -0.32, ((i * 13) % 37) - 18);
        b.material = foam;
        return b;
      });
      const buoyMat = mat('buoy', '#f2aa39'),
        buoys = Array.from({ length: 8 }, (_, i) => {
          const b = MeshBuilder.CreateCylinder(
            'course buoy',
            { diameter: 0.3, height: 0.5, tessellation: 10 },
            scene,
          );
          b.position.set(
            i % 2 === 0 ? -6 : 6,
            -0.08,
            Math.floor(i / 2) * 12 - 18,
          );
          b.material = buoyMat;
          return b;
        });
      const boatStats = boats.map((d) => stats(d));
      const hydro = boatStats[0],
        baseline = hydro.physics.freeboard - 0.74;
      const resize = new ResizeObserver(() => engine?.resize());
      resize.observe(canvas.current);
      let time = 0;
      engine.runRenderLoop(() => {
        if (!engine) return;
        const delta = Math.min(engine.getDeltaTime() / 1000, 0.05);
        time += delta;
        const moving = live.current.running,
          wave = live.current.waves;
        root.position.y =
          baseline +
          Math.sin(time * (moving ? 5 : 1.5)) *
            (moving ? 0.035 + wave * 0.06 : 0.02);
        root.rotation.z =
          -hydro.lateral * 0.002 + Math.sin(time * 1.8) * wave * 0.035;
        root.rotation.x = hydro.trim * 0.001 + (moving ? -0.025 : 0);
        if (moving) {
          ripples.forEach((b) => {
            b.position.z -= delta * hydro.knots * 0.2;
            if (b.position.z < -18) b.position.z = 18;
          });
          buoys.forEach((b) => {
            b.position.z -= delta * hydro.knots * 0.2;
            if (b.position.z < -24) b.position.z += 48;
          });
        }
        const raceData = entrants;
        const simulatedTime = raceData
          ? (Math.max(
              raceData.elapsedSeconds,
              ...raceData.opponents.map((o) => o.elapsedSeconds),
            ) *
              live.current.progress) /
            100
          : 0;
        roots.forEach((boat, i) => {
          if (i > 0) {
            boat.setEnabled(moving);
            const opponent = raceData!.opponents[i - 1];
            const relative =
              Math.min(1, simulatedTime / opponent.elapsedSeconds) -
              Math.min(1, simulatedTime / raceData!.elapsedSeconds);
            boat.position.set(
              i * 3,
              boatStats[i].physics.freeboard -
                0.74 +
                Math.sin(time * 3 + i) * wave * 0.04,
              relative * 35,
            );
            boat.rotation.x = moving ? -0.025 : 0;
          }
          boat.computeWorldMatrix(true);
          waterMat.setMatrix(
            'inverseBoat' + i,
            Matrix.Invert(boat.getWorldMatrix()),
          );
          waterMat.setFloat(
            'sealed' + i,
            boatStats[i].missing === 0 && (i === 0 || moving) ? 1 : 0,
          );
        });
        ripples.forEach((r) =>
          r.setEnabled(
            !roots.some(
              (b) =>
                b.isEnabled() &&
                Math.abs(r.position.x - b.position.x) < 1.4 &&
                Math.abs(r.position.z - b.position.z) < 3,
            ),
          ),
        );
        scene.render();
      });
      return () => {
        cameraState.current = {
          alpha: camera.alpha,
          beta: camera.beta,
          radius: camera.radius,
        };
        resize.disconnect();
        engine?.stopRenderLoop();
        scene.dispose();
      };
    } catch {
      setError(true);
      engine?.dispose();
      renderer.current = null;
    }
  }, [design, entrants]);
  return (
    <>
      <canvas
        ref={canvas}
        aria-label="Interactive 3D boat preview. Drag to rotate and pinch to zoom."
        role="img"
      />
      {error && (
        <p className="error-scene">
          3D graphics are unavailable on this device. You can still construct
          your hull and run estimated races.
        </p>
      )}
    </>
  );
}

import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';

const SEVERITY_COLORS: Record<string, string> = {
  info: '#2196F3',
  watch: '#FFD600',
  moderate: '#FF6D00',
  urgent: '#FF1744',
};

export default function ModelViewerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { annotations = [], patientName = 'Patient' } = route.params || {};

  const annotationsJSON = JSON.stringify(
    annotations.map((ann: any) => ({
      position: ann.position,
      color: SEVERITY_COLORS[ann.severity] || '#ffffff',
      label: ann.label,
      note: ann.note,
      severity: ann.severity,
    }))
  );

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0f1e; overflow: hidden; width: 100vw; height: 100vh; }
    canvas { display: block; }
    #tooltip {
      position: fixed;
      display: none;
      background: #0d1321;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      padding: 10px 14px;
      min-width: 160px;
      max-width: 220px;
      pointer-events: none;
      z-index: 100;
    }
    #tooltip .severity {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    #tooltip .label {
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 3px;
    }
    #tooltip .note {
      color: rgba(255,255,255,0.5);
      font-size: 11px;
      line-height: 1.4;
    }
    #hint {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255,255,255,0.25);
      font-size: 11px;
      font-family: -apple-system, sans-serif;
      text-align: center;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="tooltip">
    <div class="severity" id="tt-severity"></div>
    <div class="label" id="tt-label"></div>
    <div class="note" id="tt-note"></div>
  </div>
  <div id="hint">Drag to rotate · Pinch to zoom</div>

  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.155.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.155.0/examples/jsm/"
      }
    }
  </script>

  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    const annotations = ${annotationsJSON};

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0f1e');

    // Camera
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-3, -2, -2);
    scene.add(dirLight2);
    const blueLight = new THREE.PointLight(0x00c2ff, 0.3);
    blueLight.position.set(0, 0, 3);
    scene.add(blueLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 1;
    controls.maxDistance = 12;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    // Load model
    const loader = new GLTFLoader();
    loader.load('https://bolar-noncausable-jakobe.ngrok-free.dev/teeth.glb',
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Compute center and fit camera
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        controls.target.copy(center);
        camera.position.set(center.x, center.y + maxDim * 0.3, center.z + maxDim * 1.8);
        camera.lookAt(center);
        controls.update();

        // Add annotation pins at offset from center
        annotations.forEach(ann => {
          const pinGroup = new THREE.Group();
          pinGroup.position.set(
            center.x + ann.position[0],
            center.y + ann.position[1],
            center.z + ann.position[2]
          );

          // Glow sphere
          const glowGeo = new THREE.SphereGeometry(0.06, 16, 16);
          const glowMat = new THREE.MeshStandardMaterial({
            color: ann.color,
            emissive: ann.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.25,
          });
          pinGroup.add(new THREE.Mesh(glowGeo, glowMat));

          // Core sphere
          const coreGeo = new THREE.SphereGeometry(0.035, 16, 16);
          const coreMat = new THREE.MeshStandardMaterial({
            color: ann.color,
            emissive: ann.color,
            emissiveIntensity: 0.9,
          });
          const coreMesh = new THREE.Mesh(coreGeo, coreMat);
          coreMesh.userData = { annotation: ann };
          pinGroup.add(coreMesh);

          scene.add(pinGroup);
        });
      },
      undefined,
      (error) => {
        console.error('Model load error:', error);
      }
    );

    // Raycaster for tap-to-show tooltip
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('tooltip');

    renderer.domElement.addEventListener('click', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find(i => i.object.userData?.annotation);
      if (hit) {
        const ann = hit.object.userData.annotation;
        document.getElementById('tt-severity').style.color = ann.color;
        document.getElementById('tt-severity').textContent = ann.severity.toUpperCase();
        document.getElementById('tt-label').textContent = ann.label;
        document.getElementById('tt-note').textContent = ann.note;
        tooltip.style.display = 'block';
        tooltip.style.left = Math.min(e.clientX + 12, window.innerWidth - 240) + 'px';
        tooltip.style.top = Math.min(e.clientY - 10, window.innerHeight - 120) + 'px';
      } else {
        tooltip.style.display = 'none';
      }
    });

    // Animate
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{patientName}'s Mouth Model</Text>
        <View style={{ width: 24 }} />
      </View>
      <WebView
        style={styles.webview}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        allowsInlineMediaPlayback
        scrollEnabled={false}
        bounces={false}
      />
      <View style={styles.legend}>
        {[
          { color: '#2196F3', label: 'Info' },
          { color: '#FFD600', label: 'Watch' },
          { color: '#FF6D00', label: 'Moderate' },
          { color: '#FF1744', label: 'Urgent' },
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  webview: { flex: 1, backgroundColor: '#0a0f1e' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0d1321',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
});
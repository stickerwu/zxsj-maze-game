import * as THREE from 'three';
import { MAZE_WALLS, MAZE_CONFIG, BALL_SPAWN_POINTS } from '../config/mazeConfig';
import { useGameStore, BallColor } from '../store/gameStore';

// 球体颜色配置
const BALL_COLORS = {
  blue: 0x3B82F6,
  yellow: 0xEAB308,
  red: 0xEF4444,
  green: 0x10B981
} as const;

const BALL_EMISSIVE_COLORS = {
  blue: 0x1E40AF,
  yellow: 0xCA8A04,
  red: 0xDC2626,
  green: 0x059669
} as const;

export class ThreeSceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number | null = null;
  private clock: THREE.Clock;
  
  // 游戏对象
  private player: THREE.Group;
  // 人形角色模型不再需要单独的眼睛引用
  private playerShadow: THREE.Mesh | null = null;
  private balls: Map<string, THREE.Group> = new Map();
  private walls: THREE.Group;
  
  // 相机控制 - MMO风格摄像机系统
  private cameraDistance = 4; // 摄像机距离玩家的距离
  private minCameraDistance = 2; // 最小摄像机距离
  private maxCameraDistance = 8; // 最大摄像机距离
  private cameraHeight = 3; // 摄像机高度
  private cameraHorizontalAngle = 0; // 水平角度（弧度）
  private cameraVerticalAngle = Math.PI / 6; // 垂直角度（30度）
  private mouseSensitivity = 0.002; // 鼠标灵敏度
  private wheelSensitivity = 0.5; // 滚轮灵敏度
  private isMouseDown = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  
  constructor(container: HTMLElement) {
    this.clock = new THREE.Clock();
    
    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    
    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 8, 8);
    
    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);
    
    // 初始化场景元素
    this.initLighting();
    this.initGround();
    this.initStartPoint();
    this.initWalls();
    this.initPlayer();
    
    // 开始渲染循环
    this.animate();
    
    // 处理窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // 添加鼠标事件监听器
    this.setupMouseControls(container);
  }
  
  private initLighting() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xE0E7FF, 0.4);
    this.scene.add(ambientLight);
    
    // 主要方向光
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    this.scene.add(directionalLight);
    
    // 补充光源
    const directionalLight2 = new THREE.DirectionalLight(0x8B5CF6, 0.3);
    directionalLight2.position.set(-10, 5, -5);
    this.scene.add(directionalLight2);
    
    // 点光源
    const pointLight = new THREE.PointLight(0xA78BFA, 0.5, 15);
    pointLight.position.set(0, 5, 0);
    this.scene.add(pointLight);
  }
  
  private initGround() {
    const groundGeometry = new THREE.PlaneGeometry(22, 22);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1F2937,
      roughness: 0.8,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }
  
  private initStartPoint() {
    const startGroup = new THREE.Group();
    startGroup.position.set(0, 0.1, 0);
    
    // 起始点平台
    const platformGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 8);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      emissive: 0x065F46,
      emissiveIntensity: 0.3
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    startGroup.add(platform);
    
    // 起始点光环
    const torusGeometry = new THREE.TorusGeometry(1, 0.05, 8, 16);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x34D399,
      emissive: 0x10B981,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.7
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.y = 0.05;
    startGroup.add(torus);
    
    // 添加"起点"文字标识
    this.createStartPointText(startGroup);
    
    this.scene.add(startGroup);
  }
  
  // 创建起点文字标识
  private createStartPointText(parentGroup: THREE.Group) {
    // 创建Canvas纹理来渲染中文文字
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    // 设置Canvas尺寸
    canvas.width = 256;
    canvas.height = 128;
    
    // 设置文字样式
    context.fillStyle = '#FFFFFF';
    context.font = 'bold 48px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // 添加文字描边效果
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.strokeText('起点', canvas.width / 2, canvas.height / 2);
    
    // 填充文字
    context.fillText('起点', canvas.width / 2, canvas.height / 2);
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // 创建文字平面
    const textGeometry = new THREE.PlaneGeometry(2, 1);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide
    });
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 1.5, 0); // 在起点上方显示
    textMesh.rotation.x = -Math.PI / 6; // 稍微向下倾斜，便于观看
    
    parentGroup.add(textMesh);
  }
  
  private initWalls() {
    this.walls = new THREE.Group();
    this.createWalls(MAZE_WALLS);
    this.scene.add(this.walls);
  }
  
  private createWalls(wallsConfig: Array<{ position: [number, number, number]; size: [number, number, number]; rotation?: [number, number, number] }>) {
    wallsConfig.forEach((wall) => {
        // 增加墙体高度，将Y轴尺寸从原来的值增加到6
        const adjustedSize: [number, number, number] = [wall.size[0], 6, wall.size[2]];
        const wallGeometry = new THREE.BoxGeometry(...adjustedSize);
        
        // 创建实体虚空紫色材质 - MMO风格
        const wallMaterial = new THREE.MeshStandardMaterial({
          color: 0x7C3AED, // 更深的紫色
          emissive: 0x3B1F7A, // 深紫色发光
          emissiveIntensity: 0.15,
          roughness: 0.3,
          metalness: 0.1,
          envMapIntensity: 1.2
          // 移除不支持的clearcoat属性
        });
        
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        // 调整墙体位置，因为增加了高度，需要向上移动以保持底部在地面
        const adjustedPosition: [number, number, number] = [wall.position[0], wall.position[1] + 2, wall.position[2]];
        wallMesh.position.set(...adjustedPosition);
      if (wall.rotation) {
        wallMesh.rotation.set(...wall.rotation);
      }
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      this.walls.add(wallMesh);
    });
  }
  
  public updateWalls(wallsConfig: Array<{ position: [number, number, number]; size: [number, number, number]; rotation?: [number, number, number] }>) {
    // 清除现有墙体
    this.walls.clear();
    
    // 创建新的墙体
    this.createWalls(wallsConfig);
  }
  
  private initPlayer() {
    this.player = new THREE.Group();
    
    // 人形角色模型 - 使用基础几何体组合
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x3B82F6,
      emissive: 0x1E40AF,
      emissiveIntensity: 0.2,
      roughness: 0.4,
      metalness: 0.1
    });
    
    // 身体（躯干）
    const bodyGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.2);
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.position.y = 0.1;
    bodyMesh.castShadow = true;
    bodyMesh.userData.type = 'body';
    this.player.add(bodyMesh);
    
    // 头部
    const headGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const headMesh = new THREE.Mesh(headGeometry, bodyMaterial);
    headMesh.position.y = 0.525;
    headMesh.castShadow = true;
    this.player.add(headMesh);
    
    // 左臂（设置旋转轴心在肩膀位置）
    const leftArmGeometry = new THREE.BoxGeometry(0.12, 0.5, 0.12);
    const leftArmMesh = new THREE.Mesh(leftArmGeometry, bodyMaterial);
    leftArmMesh.position.set(-0.32, 0.15, 0);
    leftArmMesh.geometry.translate(0, -0.25, 0); // 将几何体向下移动，使旋转轴心在顶部
    leftArmMesh.castShadow = true;
    leftArmMesh.userData.type = 'leftArm';
    this.player.add(leftArmMesh);
    
    // 右臂（设置旋转轴心在肩膀位置）
    const rightArmGeometry = new THREE.BoxGeometry(0.12, 0.5, 0.12);
    const rightArmMesh = new THREE.Mesh(rightArmGeometry, bodyMaterial);
    rightArmMesh.position.set(0.32, 0.15, 0);
    rightArmMesh.geometry.translate(0, -0.25, 0); // 将几何体向下移动，使旋转轴心在顶部
    rightArmMesh.castShadow = true;
    rightArmMesh.userData.type = 'rightArm';
    this.player.add(rightArmMesh);
    
    // 左腿（设置旋转轴心在髋部位置）
    const leftLegGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
    const leftLegMesh = new THREE.Mesh(leftLegGeometry, bodyMaterial);
    leftLegMesh.position.set(-0.12, -0.48, 0);
    leftLegMesh.geometry.translate(0, 0.3, 0); // 将几何体向上移动，使旋转轴心在顶部
    leftLegMesh.castShadow = true;
    leftLegMesh.userData.type = 'leftLeg';
    this.player.add(leftLegMesh);
    
    // 右腿（设置旋转轴心在髋部位置）
    const rightLegGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
    const rightLegMesh = new THREE.Mesh(rightLegGeometry, bodyMaterial);
    rightLegMesh.position.set(0.12, -0.48, 0);
    rightLegMesh.geometry.translate(0, 0.3, 0); // 将几何体向上移动，使旋转轴心在顶部
    rightLegMesh.castShadow = true;
    rightLegMesh.userData.type = 'rightLeg';
    this.player.add(rightLegMesh);
    
    // 玩家眼睛（适配人形模型）
    const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      emissive: 0x60A5FA,
      emissiveIntensity: 0.3
    });
    
    // 左眼
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.06, 0.55, 0.12);
    this.player.add(leftEye);
    
    // 右眼
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.06, 0.55, 0.12);
    this.player.add(rightEye);
    
    // 方向指示箭头（显示玩家面向方向）
    const arrowGeometry = new THREE.ConeGeometry(0.08, 0.25, 6);
    const arrowMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700, // 金色箭头
      emissive: 0xFFA500,
      emissiveIntensity: 0.4
    });
    const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrowMesh.position.set(0, 0.75, 0.35); // 在玩家头顶前方
    arrowMesh.rotation.x = Math.PI / 2; // 指向前方
    this.player.add(arrowMesh);
    
    // 底部方向指示圆环（适配人形模型）
    const ringGeometry = new THREE.RingGeometry(0.4, 0.45, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.78; // 调整到脚部位置
    this.player.add(ringMesh);
    
    // 方向指示线（从圆环中心指向前方）
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.77, 0),
      new THREE.Vector3(0, -0.77, 0.5)
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xFFD700,
      linewidth: 3
    });
    const directionLine = new THREE.Line(lineGeometry, lineMaterial);
    this.player.add(directionLine);
    
    // 玩家阴影（适配人形模型）
    const shadowGeometry = new THREE.CircleGeometry(0.35, 16);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3
    });
    this.playerShadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    this.playerShadow.rotation.x = -Math.PI / 2;
    this.playerShadow.position.y = -0.79; // 调整到地面位置
    this.player.add(this.playerShadow);
    
    this.scene.add(this.player);
  }
  
  public createBall(id: string, position: [number, number, number], color: BallColor) {
    const ballGroup = new THREE.Group();
    
    // 主球体 - 增加球体大小
    const ballGeometry = new THREE.SphereGeometry(0.25, 16, 16); // 从0.2增加到0.25
    const ballMaterial = new THREE.MeshStandardMaterial({
      color: BALL_COLORS[color],
      emissive: BALL_EMISSIVE_COLORS[color],
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.1
    });
    const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    ballGroup.add(ballMesh);
    
    // 光环效果
    const torusGeometry = new THREE.TorusGeometry(0.4, 0.02, 8, 16);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: BALL_COLORS[color],
      emissive: BALL_EMISSIVE_COLORS[color],
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.rotation.x = Math.PI / 2;
    ballGroup.add(torus);
    
    // 底部光圈
    const circleGeometry = new THREE.CircleGeometry(0.3, 16);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: BALL_COLORS[color],
      transparent: true,
      opacity: 0.2
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = -position[1] + 0.02;
    ballGroup.add(circle);
    
    ballGroup.position.set(...position);
    ballGroup.userData = { id, baseY: position[1], time: 0 };
    
    this.balls.set(id, ballGroup);
    this.scene.add(ballGroup);
  }
  
  public removeBall(id: string) {
    const ball = this.balls.get(id);
    if (ball) {
      this.scene.remove(ball);
      this.balls.delete(id);
    }
  }

  public updateBalls(ballPositionsArray: (([number, number, number]) | null)[], currentColor: BallColor) {
    // 清除现有的球体
    this.balls.forEach((ball, id) => {
      this.scene.remove(ball);
    });
    this.balls.clear();
    
    // 根据传入的位置数组创建新的球体
    ballPositionsArray.forEach((position, index) => {
      if (position) {
        const ballId = `ball_${index}`;
        this.createBall(ballId, position, currentColor);
      }
    });
  }
  
  public updatePlayer(position: [number, number, number], rotation: [number, number, number], isMoving: boolean = false) {
    this.player.position.set(...position);
    this.player.rotation.set(...rotation);
    
    // 添加行走动画
    if (isMoving) {
      const time = Date.now() * 0.005;
      
      // 手臂摆动动画
      const leftArm = this.player.children.find(child => child.userData.type === 'leftArm');
      const rightArm = this.player.children.find(child => child.userData.type === 'rightArm');
      if (leftArm && rightArm) {
        leftArm.rotation.x = Math.sin(time) * 0.5;
        rightArm.rotation.x = -Math.sin(time) * 0.5;
      }
      
      // 腿部摆动动画
      const leftLeg = this.player.children.find(child => child.userData.type === 'leftLeg');
      const rightLeg = this.player.children.find(child => child.userData.type === 'rightLeg');
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = -Math.sin(time) * 0.3;
        rightLeg.rotation.x = Math.sin(time) * 0.3;
      }
      
      // 身体轻微上下浮动
      const body = this.player.children.find(child => child.userData.type === 'body');
      if (body) {
        body.position.y = 0.1 + Math.sin(time * 2) * 0.02;
      }
    } else {
      // 静止时重置动画
      const leftArm = this.player.children.find(child => child.userData.type === 'leftArm');
      const rightArm = this.player.children.find(child => child.userData.type === 'rightArm');
      const leftLeg = this.player.children.find(child => child.userData.type === 'leftLeg');
      const rightLeg = this.player.children.find(child => child.userData.type === 'rightLeg');
      const body = this.player.children.find(child => child.userData.type === 'body');
      
      if (leftArm) leftArm.rotation.x = 0;
      if (rightArm) rightArm.rotation.x = 0;
      if (leftLeg) leftLeg.rotation.x = 0;
      if (rightLeg) rightLeg.rotation.x = 0;
      if (body) body.position.y = 0.1;
    }
  }
  
  // MMO风格鼠标事件处理 - 优化版本
  private handleMouseDown = (event: MouseEvent) => {
    console.log('鼠标按下事件，按键:', event.button);
    if (event.button === 2) { // 右键
      event.preventDefault(); // 防止右键菜单干扰
      this.isMouseDown = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      console.log('右键按下，开始拖拽模式，初始位置:', { x: this.lastMouseX, y: this.lastMouseY });
      
      // 不使用指针锁定，保持更自然的鼠标控制体验
      // 指针锁定会导致鼠标移动过于敏感，影响用户体验
    }
  };
  
  private handleMouseMove = (event: MouseEvent) => {
    if (!this.isMouseDown) return;
    
    // 计算鼠标移动距离
    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;
    
    console.log('鼠标拖拽移动，增量:', { deltaX, deltaY }, '当前摄像机角度:', { 
      horizontal: this.cameraHorizontalAngle, 
      vertical: this.cameraVerticalAngle 
    });
    
    // 更新相机角度 - 以角色为中心旋转
    this.cameraHorizontalAngle -= deltaX * this.mouseSensitivity;
    this.cameraVerticalAngle += deltaY * this.mouseSensitivity;
    
    // 限制垂直角度范围（防止相机翻转）
    this.cameraVerticalAngle = Math.max(
      -Math.PI / 2.5, // -72度，允许更大的垂直视角范围
      Math.min(Math.PI / 2.5, this.cameraVerticalAngle) // 72度
    );
    
    console.log('更新后摄像机角度:', { 
      horizontal: this.cameraHorizontalAngle, 
      vertical: this.cameraVerticalAngle 
    });
    
    // 立即更新摄像机位置以提供实时反馈
    this.updateCameraImmediate();
    
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  };
  
  private handleMouseUp = (event: MouseEvent) => {
    // 处理所有鼠标按键释放，确保状态正确重置
    console.log('鼠标释放事件，按键:', event.button);
    this.isMouseDown = false;
    console.log('结束拖拽模式');
  };
  
  // 鼠标滚轮事件处理 - 实时控制摄像机距离
  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    
    // 实时响应滚轮缩放，提高灵敏度
    const delta = event.deltaY > 0 ? this.wheelSensitivity : -this.wheelSensitivity;
    const newDistance = this.cameraDistance + delta;
    
    // 立即更新摄像机距离，确保实时响应
    this.cameraDistance = Math.max(
      this.minCameraDistance,
      Math.min(this.maxCameraDistance, newDistance)
    );
    
    // 立即更新摄像机位置以实现实时缩放效果
    this.updateCameraImmediate();
  };

  private setupMouseControls(container: HTMLElement) {
    // 禁用右键菜单
    container.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // 直接在canvas元素上绑定鼠标事件，确保事件能正确触发
    const canvas = this.renderer.domElement;
    
    // 鼠标按下事件
    canvas.addEventListener('mousedown', this.handleMouseDown);
    
    // 鼠标移动事件
    canvas.addEventListener('mousemove', this.handleMouseMove);
    
    // 鼠标释放事件
    canvas.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mouseup', this.handleMouseUp); // 防止鼠标移出容器时卡住
    
    // 鼠标离开事件
    canvas.addEventListener('mouseleave', this.handleMouseUp);
    
    // 鼠标滚轮事件 - 实时响应
    canvas.addEventListener('wheel', this.handleWheel, { passive: false });
  }
  
  // MMO风格：摄像机角度不再影响角色朝向
  // 角色朝向现在完全由WASD键控制

  public updateCamera(playerPosition: [number, number, number], playerRotation: [number, number, number]) {
    const playerPos = new THREE.Vector3(...playerPosition);
    
    // MMO主机模式：摄像机角度完全独立于角色朝向
    // 只使用鼠标控制的摄像机角度，不叠加角色旋转
    const totalHorizontalAngle = this.cameraHorizontalAngle;
    const totalVerticalAngle = this.cameraVerticalAngle;
    
    // 计算相机位置（基于球坐标系，以角色为中心）
    const distance = this.cameraDistance;
    const cameraPosition = new THREE.Vector3(
      Math.sin(totalHorizontalAngle) * Math.cos(totalVerticalAngle) * distance,
      Math.sin(totalVerticalAngle) * distance + this.cameraHeight,
      Math.cos(totalHorizontalAngle) * Math.cos(totalVerticalAngle) * distance
    );
    cameraPosition.add(playerPos);
    
    // 计算看向位置（始终看向角色）
    const lookAtPosition = new THREE.Vector3(playerPos.x, playerPos.y + 1, playerPos.z);
    
    // 平滑相机移动
    this.camera.position.lerp(cameraPosition, 0.1);
    this.camera.lookAt(lookAtPosition);
  }
  
  // 立即更新摄像机位置（用于实时滚轮缩放）
  private updateCameraImmediate() {
    const gameStore = useGameStore.getState();
    const playerPos = new THREE.Vector3(...gameStore.playerPosition);
    
    // 计算相机位置（基于球坐标系，以角色为中心）
    const distance = this.cameraDistance;
    const cameraPosition = new THREE.Vector3(
      Math.sin(this.cameraHorizontalAngle) * Math.cos(this.cameraVerticalAngle) * distance,
      Math.sin(this.cameraVerticalAngle) * distance + this.cameraHeight,
      Math.cos(this.cameraHorizontalAngle) * Math.cos(this.cameraVerticalAngle) * distance
    );
    cameraPosition.add(playerPos);
    
    // 计算看向位置（始终看向角色）
    const lookAtPosition = new THREE.Vector3(playerPos.x, playerPos.y + 1, playerPos.z);
    
    // 立即更新摄像机位置，不使用lerp平滑
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(lookAtPosition);
  }
  
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    
    const delta = this.clock.getDelta();
    
    // 更新摄像机位置（基于当前玩家位置和鼠标控制的角度）
    const gameStore = useGameStore.getState();
    this.updateCamera(gameStore.playerPosition, gameStore.playerRotation);
    
    // 更新球体动画
    this.balls.forEach((ball) => {
      ball.userData.time += delta;
      
      // 浮动动画
      const floatOffset = Math.sin(ball.userData.time * 2) * 0.1;
      ball.position.y = ball.userData.baseY + floatOffset;
      
      // 旋转动画
      ball.children[0].rotation.y += delta * 0.5;
      ball.children[0].rotation.x += delta * 0.3;
      
      // 光环旋转
      if (ball.children[1]) {
        ball.children[1].rotation.y += delta * 1.5;
      }
    });
    
    this.renderer.render(this.scene, this.camera);
  };
  
  private handleResize = () => {
    const container = this.renderer.domElement.parentElement;
    if (container) {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
  };
  
  // 获取摄像机水平角度（用于MMO风格移动控制）
  public getCameraHorizontalAngle(): number {
    return this.cameraHorizontalAngle;
  }

  // 获取鼠标右键按下状态（用于MMO风格角色朝向跟随）
  public isRightMouseDown(): boolean {
    return this.isMouseDown;
  }

  public dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    // 清理鼠标事件监听器
    const container = this.renderer.domElement.parentElement;
    const canvas = this.renderer.domElement;
    
    if (container) {
      container.removeEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    // 从canvas元素移除事件监听器
    canvas.removeEventListener('mousedown', this.handleMouseDown);
    canvas.removeEventListener('mousemove', this.handleMouseMove);
    canvas.removeEventListener('mouseup', this.handleMouseUp);
    canvas.removeEventListener('mouseleave', this.handleMouseUp);
    canvas.removeEventListener('wheel', this.handleWheel);
    
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    // 清理Three.js资源
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    
    // 清空引用
    // 人形角色模型的眼睛已集成到player组中
    this.playerShadow = null;
  }
}
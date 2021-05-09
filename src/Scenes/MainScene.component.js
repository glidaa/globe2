import React from 'react';
import * as THREE from 'three';
import MetalSphere from '../Components/3D/MetalSphere.three';
import Loading from './../Components/Loading.component';
import { handleSceneResize, initEventListener } from './../Utils/sceneResize';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {Coordinates} from '../Coordinates'
import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl'


export default class MainScene extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: this.props.loading ? true : false,
        }
        //3D Scene components
        this.divRef = React.createRef();
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.time = 0;
        this.isPlaying = true;
        this.addObject = null
    }

    componentDidMount() {
        this.initScene();
    }
    initScene = () => {
        //init Loading Manager
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = () => {
            this.setState({ loading: false }, () => { })
        }

        //init Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(0x222222));
        this.renderer.setSize(this.divRef.current.offsetWidth, this.divRef.current.offsetHeight);
        this.divRef.current.appendChild(this.renderer.domElement);

        //init Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);

        //init Camera
        this.camera = new THREE.PerspectiveCamera(7, this.divRef.current.offsetWidth / this.divRef.current.offsetHeight, 0.1, 1000);
        this.camera.position.x = 30;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        //Model
        let sphere = new MetalSphere().create(loadingManager);
        this.scene.add(sphere);

        // Ambient Light
        let ambientLight = new THREE.AmbientLight(0xFFFFFF);
        ambientLight.intensity = 1;
        this.scene.add(ambientLight);
        let hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
        this.scene.add(hemiLight);

        //Directional Light
        let directionalLight = new THREE.DirectionalLight(0xe8f7ff, 4);
        directionalLight.position.set(5, 15, 70);
        this.scene.add(directionalLight);
        
        //SpotLight
        let light = new THREE.SpotLight(0xffa95c,4);
        light.position.set(-50,50,50);
        light.castShadow = true;
        this.scene.add( light );
        
        function Conversion(lat, lng){
            let phi = (90-lat)*(Math.PI/180);
            let theta = (lng+180)*(Math.PI/180);

            let x = -(Math.sin(phi)*Math.cos(theta))
            let y = (Math.sin(phi)*Math.sin(theta))
            let z = (Math.cos(phi))

            return{
                x, y, z
            }
        }

        for (let i = 0; i < Coordinates.length; i++) {
            let pos = Conversion(Coordinates[i].lat, Coordinates[i].lng);

            let mesh = new THREE.Mesh(
                new THREE.SphereBufferGeometry(0.01, 1, 1),
                new THREE.MeshBasicMaterial({color:"blue"})
            )
            mesh.position.set(pos.x,pos.y,pos.z)
            this.scene.add(mesh)
            if(i<Coordinates.length-1){
                let pos1 = Conversion(Coordinates[i+1].lat, Coordinates[i+1].lng);
                this.ConnectingLines(pos,pos1)
            }
            
        }

        //init Handle Resize
        handleSceneResize(window, this.camera, this.renderer)
        initEventListener(window);
        this.addObjects()

        const animate = () => {
            if(!this.isPlaying) return;
            this.time +=0.05;
            this.materialShaders.uniforms.time.value = this.time;
            requestAnimationFrame(animate);
            this.renderer.render(this.scene, this.camera );
            if (this.scene) {
                let rotationRad = THREE.MathUtils.degToRad(.1);
                this.scene.rotateY(rotationRad);
               
               
            }
            light.position.set( 
                this.camera.position.x + 10,
                this.camera.position.y + 10,
                this.camera.position.z + 10,
              );
              light.shadow.bias = -0.0001;
              light.shadow.mapSize.width = 1024*4;
              light.shadow.mapSize.height = 1024*4;
        }
        animate();
    }
    stop(){
        this.isPlaying = false
    }
    play(){
        if(!this.isPlaying){
            this.render()
            this.isPlaying = true
        }
    }
    addObjects(){
        this.materialShaders =  new THREE.ShaderMaterial({
            extensions:{
                derivatives:"#extension GL_OES_standard_derivatives: enable"
            },
            side:THREE.DoubleSide,
            uniforms:{
                time:{value:0},
                resolutiotion:{value: new THREE.Vector4()}
            },
            transparent:true,
            vertexShader: vertex,
            fragmentShader: fragment
        }) 
    }
   
    ConnectingLines(p1,p2){
        let v1 = new THREE.Vector3(p1.x, p1.y, p1.z)
        let v2 = new THREE.Vector3(p2.x, p2.y, p2.z)
        let points = []
        for (let i = 0; i <=20; i++) {
            let p = new THREE.Vector3().lerpVectors(v1, v2, i/20)
            p.normalize()
            p.multiplyScalar(1 + 0.2*Math.sin(Math.PI*i/20)) 
            points.push(p)             
        };
    
       
        
        const path = new THREE.CatmullRomCurve3(points)
        const geometry = new THREE.TubeBufferGeometry(path, 20, 0.005, 8, false)
        const material = new THREE.LineBasicMaterial( {
            color: "pink",
            linewidth: 1,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin:  'round', //ignored by WebGLRenderer
            
        } )
        // const material = this.materialShaders

        const mesh = new THREE.Mesh( geometry, material );
        this.scene.add( mesh );
 
    }
  

    render() {
        return (<>
            <div className="three-container" ref={this.divRef}></div>
            {this.state.loading ? <Loading /> : ''}
        </>)

    }
}
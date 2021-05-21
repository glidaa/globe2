import React from 'react';
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import fbxGlobe from '../Assets/Models/globe_export.fbx';


export default class HomeComponent extends React.Component {
	constructor(props) {
		super(props);
		this.cWidth = window.innerWidth; this.mouseX = 0;
		this.cHeight = window.innerHeight; this.mouseY = 0;
		this.raycaster = new THREE.Raycaster(); this.mouse = new THREE.Vector2();
		this.animate = this.animate.bind(this);
		this.cardMeshArr = []; this.cardFullTime = 100;
		this.state = {};
	}

	componentDidMount() {
        this.initScene();
        this.loadGlobe();
        this.animate();
        this.setCanvasSize();

		window.addEventListener('resize', this.setCanvasSize);
	}

	loadGlobe=()=>{

		new FBXLoader().load( fbxGlobe, ( object ) => {
			const vSize = new THREE.Box3().setFromObject(object).getSize(), scl = 8 / vSize.y;
			object.scale.set(scl, scl, scl);
			object.children.forEach(child => {
				if (child.name.indexOf('Box') > -1) {
					child.material[0] = new THREE.MeshStandardMaterial({color:0x2488CE});
					child.material[1] = new THREE.MeshStandardMaterial({color:0x000000});
					child.time = Math.floor(Math.random() * this.cardFullTime);
					this.cardMeshArr.push(child);
				}
			});
			this.totalGroup.add(object);
			console.log(object);
		}, undefined, function ( error ) {} );
	}

	initScene=()=>{
		this.renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
		this.renderer.setSize(this.cWidth, this.cHeight);
		if (!document.getElementById("container")) return false;
		document.getElementById("container").appendChild(this.renderer.domElement);
		this.renderer.setClearColor(0xD8D8D8, 1);

		this.camera = new THREE.PerspectiveCamera(60, this.cWidth / this.cHeight, 0.1, 50);
		this.camera.position.set(0, 0, 10);
		this.scene = new THREE.Scene();
		this.totalGroup = new THREE.Group(); this.scene.add(this.totalGroup);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enablePan = false;
		this.controls.minDistance = 5; this.controls.maxDistance = 15; 

		const ambientLight = new THREE.AmbientLight( 0xFFFFFF, 0.3 ); this.scene.add( ambientLight );
		this.mainLight = new THREE.DirectionalLight( 0xFFFFFF, 0.9 ); this.scene.add( this.mainLight );
		this.mainLight.position.set(50, 50, 50);
	}

	setCardColor = () => {
		this.cardMeshArr.forEach(card => {
			card.time++;
			if (card.time >= this.cardFullTime) card.time = 0;
			card.material[0].color.setHex(card.time < this.cardFullTime/2 ? 0xCE8824 : 0x2488CE);
		});
	}

	animate=()=>{
		if (!this.camera || !this.scene) return;
		requestAnimationFrame(this.animate);
		const camPos = this.camera.position;
		this.mainLight.position.set(camPos.x, camPos.y, camPos.z);
		this.setCardColor();
		// this.camera.lookAt( 0, 0, 0 );
		this.renderer.render(this.scene, this.camera);
	}

	setCanvasSize = () => {
		this.cWidth = window.innerWidth;
		this.cHeight = window.innerHeight;
		if (this.renderer && this.camera) {
			this.renderer.setSize(this.cWidth, this.cHeight);
			this.camera.aspect = this.cWidth/this.cHeight;
			this.camera.updateProjectionMatrix();
		}
	}

	render() {
		return (
			<div className="home">
				<div id="container"></div>
			</div>
		);
	}
}

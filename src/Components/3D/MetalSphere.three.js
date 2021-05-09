import * as THREE from 'three';
import metalTexture from './../../Assets/Textures/earth.jpg';

export default class MetalSpshere{
    
    create = (loadingManager) => {
        let geometry = new THREE.SphereBufferGeometry(1, 40, 40);
        let loader = new THREE.TextureLoader(loadingManager);
        let texture = loader.load(metalTexture);
        let material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: .9,
            roughness: .65,
            emissive: 0x222529,
        });

        //Assign geometry and material to the mesh
        let mesh = new THREE.Mesh(geometry, material);

        //Return the mesh
        return mesh;
    }
}
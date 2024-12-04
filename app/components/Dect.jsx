'use client'
import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export default function Home() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        // Load the COCO-SSD model
        const loadModel = async () => {
            const model = await cocoSsd.load();
            setIsModelLoaded(true);
            detectObjects(model);
        };

        // Start the webcam
        const startCamera = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        };

        startCamera();
        loadModel();
    }, []);

    const detectObjects = async (model) => {
        if (videoRef.current) {
            const detect = async () => {
                const predictions = await model.detect(videoRef.current);
                setPredictions(predictions);
                drawPredictions(predictions);
                requestAnimationFrame(detect);
            };
            detect();
        }
    };

    const drawPredictions = (predictions) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach((prediction) => {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(...prediction.bbox);
            ctx.font = '16px Arial';
            ctx.fillStyle = 'red';
            ctx.fillText(
                `${prediction.class} (${(prediction.score * 100).toFixed(2)}%)`,
                prediction.bbox[0],
                prediction.bbox[1] - 10
            );
        });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Real-Time Object Detection</h1>
            <div className="relative">
                <video
                    ref={videoRef}
                    className="rounded-md"
                    autoPlay
                    muted
                    width="640"
                    height="480"
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0"
                    width="640"
                    height="480"
                />
            </div>
            {!isModelLoaded && <p className="text-yellow-500 mt-4">Loading model...</p>}
            {isModelLoaded && predictions.length > 0 && (
                <div className="mt-4 bg-gray-800 p-4 rounded-md">
                    <h2 className="text-lg font-bold">Detected Objects:</h2>
                    <ul>
                        {predictions.map((pred, index) => (
                            <li key={index}>
                                {pred.class} - {(pred.score * 100).toFixed(2)}%
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

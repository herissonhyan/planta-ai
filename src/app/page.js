'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [dados, setDados] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Estado para controlar o texto "Processando..."
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null); // Referência para o som de câmera

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const startWebcam = async () => {
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } }
        });
        console.log("Câmera traseira iniciada com sucesso.");
      } catch (error) {
        if (error.name === "OverconstrainedError") {
          console.warn("Câmera traseira não disponível, tentando a câmera frontal.");
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });
          console.log("Câmera frontal iniciada com sucesso.");
        } else {
          throw error;
        }
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      } else {
        console.error("videoRef.current é nulo.");
      }
    } catch (error) {
      console.error("Erro ao acessar a webcam:", error);
      alert("Não foi possível acessar a câmera. Verifique as permissões e compatibilidade do dispositivo.");
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Data = canvas.toDataURL('image/png');
      audioRef.current.play(); // Toca o som da câmera
      setIsProcessing(true); // Ativa o estado de processamento
      chamarAPI(base64Data);
    } else {
      console.error("videoRef.current é nulo ao capturar a imagem.");
    }
  };

  async function chamarAPI(base64Data, metodo = 'POST') {
    try {
      const opcoes = {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Data }),
      };

      const resposta = await fetch("/api", opcoes);

      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status} - ${resposta.statusText}`);
      }

      const dados = await resposta.json();
      setDados(dados);
    } catch (erro) {
      console.error('Erro ao chamar API:', erro);
    } finally {
      setIsProcessing(false); // Desativa o estado de processamento ao receber a resposta da API
    }
  }

  return (
    <div className={styles.container}>
      {showSplash ? (
        <div className={styles.splash}>
          <img src="./logo_completa.jpg" alt="Carregando..." className={styles.splashImage} />
        </div>
      ) : (
        <>
          <div className={styles.navbar}>
            <img src="./logo_navbar.jpg" alt="Navbar" className={styles.navbarImage} />
          </div>
          <div className={styles.content}>
            <div className={styles.videoContainer}>
              <video ref={videoRef} autoPlay className={styles.video}></video>
              {isProcessing && (
                <div className={styles.processingOverlay}>
                  <span>Processando...</span>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <div className={styles.button_container}>
              <button onClick={isCapturing ? captureImage : startWebcam} className={styles.button}>
                {isCapturing ? "Capturar Imagem" : "Clique aqui para iniciar"}
              </button>
            </div>
            {dados && <div className={styles.apiResponse}>{dados.description}</div>}
            <audio ref={audioRef} src="/sound.mp3" preload="auto" /> {/* Som de câmera */}
          </div>
        </>
      )}
    </div>
  );
}

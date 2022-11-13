import styles from '../styles/Home.module.css'
import { Web3Provider } from "@ethersproject/providers";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { useViewerConnection } from "@self.id/react";
import { EthereumAuthProvider } from "@self.id/web";
import { useViewerRecord } from "@self.id/react";

export default function Home() {
    const [connection, connect, disconnect] = useViewerConnection();
    const web3ModalRef = useRef();

    const connectToSelfID = async () => {
        const ethereumAuthProvider = await getEthereumAuthProvider();
        connect(ethereumAuthProvider);
    };

    const getEthereumAuthProvider = async () => {
        const wrappedProvider = await getProvider();
        const signer = wrappedProvider.getSigner();
        const address = await signer.getAddress();
        return new EthereumAuthProvider(wrappedProvider.provider, address);
    };

    const getProvider = async () => {
        const provider = await web3ModalRef.current.connect();
        const wrappedProvider = new Web3Provider(provider);
        return wrappedProvider;
    };

    useEffect(() => {
        if (connection.status !== "connected") {
            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            });
        }
    }, [connection.status]);

    return (
        <div className={styles.main}>
            <div className={styles.navbar}>
                <span className={styles.title}>Ceramic Demo</span>
                {connection.status === "connected" ? (
                    <span className={styles.subtitle}>Conectado</span>
                ) : (
                    <button
                        onClick={connectToSelfID}
                        className={styles.button}
                        disabled={connection.status === "connecting"}
                    >
                        Conectar
                    </button>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.connection}>
                    {connection.status === "connected" ? (
                        <div>
                            <span className={styles.subtitle}>
                                Tu 3ID es {connection.selfID.id}
                            </span>
                            <RecordSetter />
                        </div>
                    ) : (
                        <span className={styles.subtitle}>
                            Conecta tu wallet para acceder a tu 3ID
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function RecordSetter() {
    const [name, setName] = useState("");
    const record = useViewerRecord("basicProfile");

    const updateRecordName = async (name) => {
        await record.merge({
            name: name,
        });
    };

    return (
        <div className={styles.content}>
            <div className={styles.mt2}>
                {record.content ? (
                    <div className={styles.flexCol}>
                        <span className={styles.subtitle}>¡¡Hola {record.content.name}!!</span>

                        <span>
                            El nombre de arriba ha sido cargado desde la red de Ceramic, Intenta actualizarlo a continuación:
                        </span>
                    </div>
                ) : (
                    <span>
                        No tienes un registro de perfil emparejado con tu 3ID. Crea un perfil configurando un nombre a continuación:
                    </span>
                )}
            </div>

            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.mt2}
            />
            <button onClick={() => updateRecordName(name)}>Actualizar</button>
        </div>
    );
}

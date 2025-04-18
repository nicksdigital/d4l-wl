import '../styles/globals.css';
import { Web3Provider } from '../contexts/Web3Context';
import { SoulStreamProvider } from '../contexts/SoulStreamContext';
import { CrossChainProvider } from '../contexts/CrossChainContext';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <Web3Provider>
      <SoulStreamProvider>
        <CrossChainProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CrossChainProvider>
      </SoulStreamProvider>
    </Web3Provider>
  );
}

export default MyApp;

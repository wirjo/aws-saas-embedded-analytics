import { Amplify, API } from 'aws-amplify';
import awsconfig from './aws-exports';
import logo from './logo.svg';
import { useState } from 'react';
import './App.css';
import {
  embedDashboard
} from 'amazon-quicksight-embedding-sdk';

Amplify.configure(awsconfig);

const Loading = () => (
  <div className="loading">
    <i className="fa fa-circle-notch fa-spin"></i>
  </div>
)

const TenantSelector = ({ tenantId, setTenantId, getEmbedUrl, isLoading }) => (
    <form>
      <input placeholder="Tenant Id (e.g. 1-100)" type="text" value={tenantId} onChange={(e) => setTenantId(e.target.value)}/> 
      <button type="submit" onClick={e => { e.preventDefault(); getEmbedUrl(tenantId); }}>
        { isLoading ? <Loading/> : "View as Tenant" }
      </button>
    </form>
);

const Embed = () => {
  const [tenantId, setTenantId] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getEmbedUrl = () => {
    setIsLoading(true);
    const apiName = 'api';
    const path = `/analytics/${tenantId}`;
    API.get(apiName, path).then(response => {
      setEmbedUrl(response);
      doEmbedDashboard(response.EmbedUrl);
    }).catch(error => {
      console.error(error);
    });
    return false;
  }

  const dashboardLoaded = () => {
    setIsLoading(false);
  }

  const doEmbedDashboard = (url) => {
    const containerDiv = document.getElementById("dashboard-container");   
    containerDiv.innerHTML = '';

    // Embed dashboard based on short-lived embed URL
    // https://github.com/awslabs/amazon-quicksight-embedding-sdk#dashboard-embedding
    const options = {
        url: url,
        container: containerDiv,
        height: "AutoFit",
        loadingHeight: "100%",
        scrolling: "no",
        printEnabled: true,
        footerPaddingEnabled: true,
        loadCallback: dashboardLoaded
    };

    embedDashboard(options);
  }

  return (
    <>
    <div className="App">
      <header className="App-header">
        <img className="App-logo" src={logo} alt="Demo" />
        <div className="App-title">
          Embedded Analytics Demo
        </div>
        <div className="App-github">
          <a title="Source Code on Github" href="https://github.com/wirjo/aws-saas-embedded-analytics/"><i className="fa-brands fa-github"></i></a>
        </div>
        <div className="App-github">
          <a title="View Raw Data on AWS Console" href="https://s3.console.aws.amazon.com/s3/object/aws-demo-sample-financial-data?region=ap-southeast-2&prefix=transactions/transactions.csv"><i className="fa-brands fa-aws"></i></a>
        </div>

        <div className="App-tenant-selector">
          <TenantSelector tenantId={tenantId} setTenantId={setTenantId} getEmbedUrl={getEmbedUrl} isLoading={isLoading} />
        </div>
        <div className="App-embed-url">
          <label title="Embed URL (for demo purposes)"><i className="fa fa-link"></i></label>
          <input placeholder="Enter a tenant to generate unique QuickSight embed URL" type="text" onClick={e => e.target.select()} disabled={true} value={!isLoading ? embedUrl.EmbedUrl : 'Loading...'}></input>
        </div>
        <div className="App-user">
          <div className="avatar"></div>
          <div className="tenant-identifier">Tenant {isLoading ? <Loading/> : (tenantId ? tenantId : '?')}</div>
        </div>
      </header>
    </div>
    <div className="App-wrapper">
        { isLoading ? <Loading/> : "" }
        <div id="dashboard-container" className={isLoading ? 'hidden' : ''}></div>
    </div>
    </>
  );
}

const App = () => (
  <>
    <Embed />
  </>
)

export default App;

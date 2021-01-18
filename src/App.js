import "./App.css";
import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
function GetInfoOnCountry() {
  const alpha2Context = useContext(AlphaContext);
  let alpha2 = useMemo(() => {
    return alpha2Context;
  }, [alpha2Context]);
  useEffect(() => {}, [alpha2Context]);
  const GET_INFO = gql`
    query GetInfo($alpha2: String!) {
      country(alpha2: $alpha2) {
        name
        prediction {
          date
          cases
        }
        covid {
          cases
          deaths
          recovered
          last_update
        }
      }
    }
  `;
  const { loading, error, data, refetch } = useQuery(GET_INFO, {
    variables: { alpha2 },
    pollInterval: 1000,
  });

  if (loading) return <p>Loading..</p>;
  if (error) return <p>Error {error.message}</p>;
  return (
    <>
      <p>Country code: {alpha2}</p>
      <p>Cases: {data.country.covid.cases}</p>
      <p>Recovered : {data.country.covid.recovered}</p>
      <p>Deaths: {data.country.covid.deaths}</p>
      <p>
        Last update:{" "}
        {DateTime.fromISO(data.country.covid.last_update).toLocaleString()}
      </p>
      <table>
        <thead>
          <tr>
            <th>Dates</th>
            <th>Cases</th>
          </tr>
        </thead>
        <tbody>
          {data.country.prediction.map((item) => (
            <>
              <tr key={item.date}>
                <td>{item.date}</td>
                <td>{item.cases}</td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
      <button onClick={() => refetch()}>Click here to refresh</button>
    </>
  );
}

const AlphaContext = createContext("");
function GetCountries(props) {
  const [alpha2, setAlpha2] = useState("AF");
  const GET_COUNTRIES = gql`
    query {
      countries {
        name
        alpha2
      }
    }
  `;

  const { loading, error, data } = useQuery(GET_COUNTRIES);
  if (loading) return <p>loading</p>;
  const onCountryChange = (e) => {
    setAlpha2(e.target.value);
  };
  return (
    <>
      <select name="country" onChange={onCountryChange}>
        {data.countries.map((item) => (
          <option key={item.alpha2} value={item.alpha2}>
            {item.name}
          </option>
        ))}
      </select>
      <AlphaContext.Provider value={alpha2}>
        {props.children}
      </AlphaContext.Provider>
    </>
  );
}

function App() {
  const client = new ApolloClient({
    uri: "http://localhost:4000",
    cache: new InMemoryCache(),
  });

  return (
    <div className="App">
      <ApolloProvider client={client}>
        <div>
          <GetCountries>
            <GetInfoOnCountry />
          </GetCountries>
        </div>
      </ApolloProvider>
    </div>
  );
}

export default App;

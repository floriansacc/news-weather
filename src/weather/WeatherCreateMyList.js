import { useEffect, useState, useRef } from "react";
import WeatherUID from "./WeatherUID";

export default function WeatherCreateMyList(props) {
  const {
    dataimport,
    mouseenter,
    mouseleave,
    basetime,
    basetimeforecast,
    servicekey,
    srcimage,
    updatedate,
    basedate,
    activetab,
    resizew,
  } = props;
  const [liste, setListe] = useState([]);
  const [elem, setElem] = useState([]);
  const [listeCounter, setListeCounter] = useState(0);
  const [isFetch, setIsFetch] = useState(false);
  const [isFetch2, setIsFetch2] = useState(false);
  const [displayWeatherList, setDisplayWeatherList] = useState(false);

  const [weatherInfoNow, setWeatherInfoNow] = useState({});
  const [weatherForecast, setWeatherForecast] = useState({});
  const [skyForecast, setSkyForecast] = useState({});
  const [tempForecast, setTempForecast] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadedForecast, setIsLoadedForecast] = useState(false);

  const [countSlide, setCountSlide] = useState(0);
  const [toTranslate, setToTranslate] = useState(resizew);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const weatherUrlNow =
    "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
  const weatherUrlForecast =
    "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";

  const handleCitySelector = (e) => {
    if (e.target.name === "one") {
      setElem([e.target.value]);
    } else if (e.target.name === "two") {
      setElem([elem[0], e.target.value]);
    } else if (e.target.name === "three") {
      let [coord] = Array.from(
        new Set(
          dataimport
            .filter(
              (word) =>
                word.Part3 === e.target.value &&
                word.Part2 === elem[1] &&
                word.Part1 === elem[0],
            )
            .map((x) => [x.nx, x.ny]),
        ),
      );
      setElem([elem[0], elem[1], e.target.value, coord[0], coord[1]]);
    }
  };

  const handleAddToList = () => {
    if (
      liste.some((e) => e.Phase3 === elem[2] && e.Phase2 === elem[1]) ||
      !elem[2]
    ) {
      window.console.log("nothing to add");
      return false;
    } else {
      setListe((prev) => [
        ...prev,
        {
          Phase1: elem[0],
          Phase2: elem[1],
          Phase3: elem[2],
          nx: elem[3],
          ny: elem[4],
        },
      ]);
      setElem(["선택"]);
      setListeCounter((prev) => prev + 1);
      setDisplayWeatherList(false);
      setIsLoaded(false);
      setIsLoadedForecast(false);
      setIsFetch(false);
      setIsFetch2(false);
      setCountSlide("0");
      document.getElementById("Displaybutton").style.background = "";
      document.getElementById("Displaybutton").style.color = "";
    }
  };

  const handleResetListe = (e) => {
    setListe([]);
    setDisplayWeatherList(false);
    setIsLoaded(false);
    setIsLoadedForecast(false);
    setIsFetch(false);
    setIsFetch2(false);
    setWeatherInfoNow({});
    setWeatherForecast({});
    setTempForecast({});
    setSkyForecast({});
    setListeCounter(0);
    setCountSlide("0");
    document.getElementById("Displaybutton").style.background = "";
    document.getElementById("Displaybutton").style.color = "";
  };

  const handleDisplayWeatherSlide = (e) => {
    if (isFetch && isFetch2 && displayWeatherList === false) {
      setDisplayWeatherList(true);
      setIsLoaded(true);
      setIsLoadedForecast(true);
      e.target.style.color = "#fff";
    }
    if (displayWeatherList === true) {
      setDisplayWeatherList(false);
      setIsLoaded(false);
      setIsLoadedForecast(false);
      e.target.style.color = "";
      setCountSlide("0");
    }
  };

  const handleCommand = () => {
    window.console.log("MAP");
    window.console.log(weatherInfoNow);
    window.console.log("MAP2");
    window.console.log(weatherForecast);
    window.console.log(skyForecast);
    window.console.log(tempForecast);
    window.console.log(liste.length);
  };

  const handleBullet = (e) => {
    setCountSlide(e.target.innerHTML);
    //setToTranslate(resizew * e.tatget.innerHTML);
  };

  const handleDisplayDescription = (e) => {
    document.getElementById("displaydescription").style.display =
      isFetch && isFetch2 ? "none" : "block";
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleDisplayMouseLeave = (e) => {
    document.getElementById("displaydescription").style.display = "none";
  };

  const toStyleDisplayButton = {
    filter: isFetch && isFetch2 ? "" : "brightness(0.8)",
  };

  const toStyleDisplayDescription = {
    left: mousePosition.x,
    top: mousePosition.y + 15,
  };

  const handleSwipe = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    window.console.log(mousePosition.x);
  };

  useEffect(() => {
    if (!liste[0]) {
      return;
    } else {
      const getWeatherList = async (name, nx, ny) => {
        let temporary = [];
        const urlWeatherList = `${weatherUrlNow}?serviceKey=${servicekey}&numOfRows=60&dataType=JSON&pageNo=1&base_date=${basedate}&base_time=${basetime}&nx=${nx}&ny=${ny}`;
        try {
          const response = await fetch(urlWeatherList, {
            headers: {
              Accept: "application / json",
            },
          });
          if (!response.ok) {
            throw new Error("Pas de météo pour toi");
          }
          const jsonResponse = await response.json();
          window.console.log([
            "LIST",
            jsonResponse.response.header["resultMsg"],
            jsonResponse.response.body.items.item,
          ]);
          await jsonResponse.response.body.items.item.map((x, i) => {
            temporary[i] = {
              phase1: name[0],
              phase2: name[1],
              phase3: name[2],
              category: x.category,
              value: x.obsrValue,
              time: x.baseTime,
              nx: nx,
              ny: ny,
            };
          });
          return [temporary, setIsFetch(true)];
        } catch (error) {
          console.log(`Premier fetch error: ${error}`);
          setIsLoaded(false);
        }
      };
      let saveData = async () => {
        let resultsFirstFetch = await getWeatherList(
          [
            liste[listeCounter - 1]["Phase1"],
            liste[listeCounter - 1]["Phase2"],
            liste[listeCounter - 1]["Phase3"],
          ],
          liste[listeCounter - 1]["nx"],
          liste[listeCounter - 1]["ny"],
        );
        try {
          setWeatherInfoNow((prev) => ({
            ...prev,
            [`${liste[listeCounter - 1]["Phase2"]} - ${
              liste[listeCounter - 1]["Phase3"]
            }`]: resultsFirstFetch[0],
          }));
        } catch (error) {
          window.console.log(error);
          setIsFetch(false);
        }
      };
      setWeatherInfoNow((prev) => ({
        ...prev,
        [`${liste[listeCounter - 1]["Phase2"]} - ${
          liste[listeCounter - 1]["Phase3"]
        }`]: [],
      }));
      saveData();
    }
    return () => {
      setIsLoaded(false);
      setIsFetch(false);
    };
  }, [listeCounter]);

  useEffect(() => {
    if (!liste[0]) {
      return;
    } else {
      const getWeatherList = async (name, nx, ny) => {
        let temporary = [];
        const urlWeatherForecast = `${weatherUrlForecast}?serviceKey=${servicekey}&numOfRows=60&dataType=JSON&pageNo=1&base_date=${basedate}&base_time=${basetimeforecast}&nx=${nx}&ny=${ny}`;
        try {
          const response = await fetch(urlWeatherForecast, {
            headers: {
              Accept: "application / json",
            },
          });
          if (!response.ok) {
            throw new Error("Pas de météo pour toi");
          }
          const jsonResponse = await response.json();
          window.console.log([
            `List Predi ${name}`,
            jsonResponse.response.header["resultMsg"],
            jsonResponse.response.body.items.item,
          ]);
          jsonResponse.response.body.items.item.forEach((x, i) => {
            let newData = {
              phase1: name[0],
              phase2: name[1],
              phase3: name[2],
              category: x.category,
              time: x.fcstTime,
              value: x.fcstValue,
              basetime: x.baseTime,
              nx: x.nx,
              ny: x.ny,
            };
            if (x.category === "PTY") {
              temporary[i] = newData;
            } else if (x.category === "T1H") {
              temporary[i] = newData;
            } else if (x.category === "SKY") {
              temporary[i] = newData;
            }
          });
          return [temporary, setIsFetch2(true)];
        } catch (error) {
          window.console.log(error);
          setIsFetch2(false);
        }
      };
      let saveData = async () => {
        try {
          let resultsFirstFetch = await getWeatherList(
            [
              liste[listeCounter - 1]["Phase1"],
              liste[listeCounter - 1]["Phase2"],
              liste[listeCounter - 1]["Phase3"],
            ],
            liste[listeCounter - 1]["nx"],
            liste[listeCounter - 1]["ny"],
          );
          window.console.log("Fetch2 ok");
          setSkyForecast((prev) => ({
            ...prev,
            [`${liste[listeCounter - 1]["Phase2"]} - ${
              liste[listeCounter - 1]["Phase3"]
            }`]: resultsFirstFetch[0].filter((x) => x.category === "SKY"),
          }));
          setWeatherForecast((prev) => ({
            ...prev,
            [`${liste[listeCounter - 1]["Phase2"]} - ${
              liste[listeCounter - 1]["Phase3"]
            }`]: resultsFirstFetch[0].filter((x) => x.category === "PTY"),
          }));
          setTempForecast((prev) => ({
            ...prev,
            [`${liste[listeCounter - 1]["Phase2"]} - ${
              liste[listeCounter - 1]["Phase3"]
            }`]: resultsFirstFetch[0].filter((x) => x.category === "T1H"),
          }));
        } catch (error) {
          window.console.log(error);
        }
      };
      setWeatherForecast((prev) => ({
        ...prev,
        [`${liste[listeCounter - 1]["Phase2"]} - ${
          liste[listeCounter - 1]["Phase3"]
        }`]: [],
      }));
      setTempForecast((prev) => ({
        ...prev,
        [`${liste[listeCounter - 1]["Phase2"]} - ${
          liste[listeCounter - 1]["Phase3"]
        }`]: [],
      }));
      setSkyForecast((prev) => ({
        ...prev,
        [`${liste[listeCounter - 1]["Phase2"]} - ${
          liste[listeCounter - 1]["Phase3"]
        }`]: [],
      }));
      saveData();
    }

    return () => {
      //setIsLoaded(false);
      setIsFetch2(false);
    };
  }, [listeCounter]);

  useEffect(() => {
    if (isFetch && isFetch2) {
      document.getElementById("Displaybutton").style.borderColor = "red";
    }
    return () => {
      document.getElementById("Displaybutton").style.borderColor = "";
    };
  }, [isFetch, isFetch2]);

  useEffect(() => {
    return () => {
      //document.getElementById("displaydescription").style.display = "none";

      document.getElementById("displaydescription").style.bakcground = "red";
    };
  }, []);

  return (
    <div
      className={`${
        activetab === 1 ? "hidden" : "flex"
      } h-fit w-fit flex-row-reverse flex-wrap items-center sm:w-full sm:flex-col sm:flex-nowrap md:w-full md:flex-col md:flex-nowrap`}
    >
      <div
        className={`relative mx-6 box-content h-full min-h-96 w-full flex-shrink-0 flex-col flex-nowrap items-center justify-start overflow-hidden rounded-3xl bg-slate-700 scrollbar-hide sm:m-0 sm:w-full ${
          isLoaded ? "h-fit" : "h-128 animate-pulse-slow"
        }`}
      >
        {isLoaded && isLoadedForecast && (
          <ul
            style={{
              transform: `translate3d(${-countSlide * resizew}px, 0, 0)`,
            }}
            className={`relative z-30 flex h-full w-full justify-start `}
            onPointerDown={handleSwipe}
          >
            {liste.map((x, i) => (
              <li key={i}>
                <WeatherUID
                  dataimport={dataimport}
                  srcimage={srcimage}
                  loadstate={isLoaded}
                  loadforecast={isLoadedForecast}
                  raincond={
                    weatherInfoNow[
                      `${liste[i]["Phase2"]} - ${liste[i]["Phase3"]}`
                    ][0]
                  }
                  humidity={
                    weatherInfoNow[
                      `${liste[i]["Phase2"]} - ${liste[i]["Phase3"]}`
                    ][1]
                  }
                  hourrain={
                    weatherInfoNow[
                      `${liste[i]["Phase2"]} - ${liste[i]["Phase3"]}`
                    ][2]
                  }
                  temp={
                    weatherInfoNow[
                      `${liste[i]["Phase2"]} - ${liste[i]["Phase3"]}`
                    ][3]
                  }
                  winddir={
                    weatherInfoNow[
                      `${liste[i]["Phase2"]} - ${liste[i]["Phase3"]}`
                    ][5]
                  }
                  windspeed={
                    weatherInfoNow[
                      `${liste[i]["Phase2"]} - ${liste[i]["Phase3"]}`
                    ][7]
                  }
                  tempforecast={
                    tempForecast[
                      `${liste[i]["Phase2"]} - ${liste[i]["Phase3"]}`
                    ]
                  }
                  skyforecast={
                    skyForecast[`${liste[i]["Phase2"]} - ${liste[i]["Phase3"]}`]
                  }
                  rainforecast={
                    weatherForecast[
                      `${liste[i]["Phase2"]} - ${liste[i]["Phase3"]}`
                    ]
                  }
                  showbutton={false}
                  titlename={true}
                  forlist={true}
                  resizew={resizew}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      {!displayWeatherList && <div className="h-8 w-full p-5"></div>}
      {displayWeatherList && (
        <ul className="z-0 flex h-8 w-full list-none items-center justify-center rounded-2xl p-5">
          {liste.map((e, i) => (
            <li
              onClick={handleBullet}
              className={`relative mx-1 inline-block h-6 w-full rounded-2xl border border-solid border-green-100 indent-inf text-xs ${
                countSlide === `${i}`
                  ? "bg-purpleflo"
                  : " cursor-pointer bg-black transition-all delay-0 duration-200 ease-in hover:scale-105 hover:animate-pulse hover:bg-purpleflo"
              }`}
              key={`bullet${i}`}
            >
              {i}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex h-full w-11/12 flex-col items-start justify-start rounded-xl p-1">
        <div className="flex w-full flex-row flex-nowrap items-center justify-center rounded-xl border border-black">
          <div className="m-1 flex flex-col flex-nowrap items-center">
            <button
              className="m-1.5 flex h-fit items-center rounded-full border-2 border-gray-400 bg-gradient-to-r from-gray-300 to-gray-400 p-1.5"
              onClick={handleAddToList}
              onMouseEnter={mouseenter}
              onMouseLeave={mouseleave}
            >
              Add to my list
            </button>
            <button
              className={`m-1.5 flex h-fit items-center rounded-full border-2 border-gray-400 bg-gradient-to-r from-gray-300 to-gray-400 p-1.5
            ${isFetch && isFetch2 ? "brightness-100" : "brightness-75"}`}
              onMouseEnter={isFetch && isFetch2 ? mouseenter : null}
              onMouseLeave={
                isFetch && isFetch2 ? mouseleave : handleDisplayMouseLeave
              }
              onMouseMove={handleDisplayDescription}
              onClick={isFetch && isFetch2 ? handleDisplayWeatherSlide : null}
              id="Displaybutton"
            >
              Display Weather
            </button>
          </div>
          <div>
            <label className="flex flex-col flex-nowrap">
              <select
                className="m-1 w-36 rounded-xl border-2 border-gray-300 bg-inherit"
                name="one"
                value={elem[0]}
                onChange={handleCitySelector}
              >
                <option name="one" value="선택" label="선택"></option>
                {Array.from(new Set(dataimport.map((obj) => obj.Part1))).map(
                  (x, i) => {
                    return (
                      <option
                        name="one"
                        value={x}
                        label={x}
                        key={`optionlist1${i}`}
                      ></option>
                    );
                  },
                )}
              </select>
              <select
                className="m-1 w-36 rounded-xl border-2 border-gray-300 bg-inherit"
                name="two"
                value={elem[1]}
                onChange={handleCitySelector}
              >
                {Array.from(
                  new Set(
                    dataimport
                      .filter((word) => word.Part1 === elem[0])
                      .map((obj) => obj.Part2),
                  ),
                ).map((x, i) => {
                  return (
                    <option
                      name="two"
                      value={x}
                      label={x}
                      key={`optionlist2${i}`}
                    ></option>
                  );
                })}
              </select>
              <select
                className="m-1 w-36 rounded-xl border-2 border-gray-300 bg-inherit"
                name="three"
                value={elem[2]}
                onChange={handleCitySelector}
              >
                {Array.from(
                  new Set(
                    dataimport
                      .filter(
                        (word) =>
                          word.Part2 === elem[1] && word.Part1 === elem[0],
                      )
                      .map((obj) => obj),
                  ),
                ).map((x, i) => {
                  return (
                    <option
                      name="three"
                      value={x.Part3}
                      label={x.Part3}
                      key={`optionlist3${i}`}
                    ></option>
                  );
                })}
              </select>
            </label>
          </div>
          <div className="flex w-fit flex-col flex-nowrap items-center">
            <p
              style={toStyleDisplayDescription}
              className="absolute hidden h-fit w-fit rounded-3xl border border-solid border-black bg-white px-1 py-1"
              id="displaydescription"
            >
              Need to fill the list before display
            </p>
            <button
              className="m-1.5 flex h-8 items-center rounded-full border-2 border-gray-400 bg-gradient-to-r from-gray-300 to-gray-400 p-1.5"
              onClick={handleResetListe}
              onMouseEnter={mouseenter}
              onMouseLeave={mouseleave}
            >
              Reset
            </button>
            <button
              className="m-1.5 hidden h-8 items-center rounded-full border-2 border-gray-400 bg-gradient-to-r from-gray-300 to-gray-400 p-1.5"
              onMouseEnter={mouseenter}
              onMouseLeave={mouseleave}
              onClick={handleCommand}
            >
              Console
            </button>
          </div>
        </div>
        {liste[0] && <p className="mt-6">List of city to display:</p>}
        <div
          className={`${
            liste[0] ? "grid" : "hidden"
          }  my-4 w-full auto-rows-t1 grid-cols-3 justify-items-center rounded-xl border border-solid border-black`}
        >
          {liste[0] && (
            <>
              <p className="my-1 font-semibold">1단계</p>
              <p className="my-1 font-semibold">2단계</p>
              <p className="my-1 font-semibold">3단계</p>
            </>
          )}
          {liste.map((x, i) => (
            <>
              <p className="min-w-33 text-center" key={`p1${i}`}>
                {x.Phase1}
              </p>
              <p className="min-w-33 text-center" key={`p2${i}`}>
                {x.Phase2}
              </p>
              <p className="w-fit min-w-25 text-center" key={`p3${i}`}>
                {x.Phase3}
              </p>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

const getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lon, type } = req.query;

    // =========================
    // VALIDATION
    // =========================

    if (!lat || !lon || !type) {
      return res.status(400).json({
        message: "Latitude, longitude and type are required."
      });
    }

    if (type !== "cafe" && type !== "hotel") {
      return res.status(400).json({
        message: "Type must be cafe or hotel."
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lon);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return res.status(400).json({
        message: "Invalid coordinates."
      });
    }


    // =========================
    // OVERPASS QUERY
    // =========================

    let query = "";


    // =========================
    // CAFES
    // =========================

    if (type === "cafe") {

      query = `
        [out:json][timeout:45];

        (
          nwr["amenity"="cafe"]
            (around:20000,${latitude},${longitude});

          nwr["cafe"="yes"]
            (around:20000,${latitude},${longitude});

          nwr["shop"="coffee"]
            (around:20000,${latitude},${longitude});

          nwr["amenity"="restaurant"]
            ["cuisine"~"coffee|cafe|coffee_shop",i]
            (around:20000,${latitude},${longitude});
        );

        out center tags;
      `;

    }


    // =========================
    // HOTELS
    // =========================

    if (type === "hotel") {

      query = `
        [out:json][timeout:45];

        (
          nwr["tourism"="hotel"]
            (around:10000,${latitude},${longitude});

          nwr["tourism"="motel"]
            (around:10000,${latitude},${longitude});

          nwr["tourism"="guest_house"]
            (around:10000,${latitude},${longitude});
        );

        out center tags;
      `;

    }


    // =========================
    // OVERPASS SERVERS
    // =========================

    const overpassServers = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];


    let data = null;
    let lastError = null;


    // =========================
    // TRY SERVERS
    // =========================

    for (const server of overpassServers) {

      try {

        console.log(
          `Trying Overpass server: ${server}`
        );


        const response = await fetch(
          server,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",

              "User-Agent":
                "TripForge/1.0 (travel planning application)",

              "Referer":
                "http://localhost:5173/"
            },

            body:
              "data=" +
              encodeURIComponent(query)
          }
        );


        // =========================
        // SERVER ERROR
        // =========================

        if (!response.ok) {

          const errorText =
            await response.text();

          console.log(
            `Overpass server failed: ${server}`
          );

          console.log(
            `Status: ${response.status}`
          );

          console.log(
            errorText.substring(0, 300)
          );

          lastError =
            new Error(
              `Overpass API returned ${response.status}`
            );

          continue;
        }


        // =========================
        // JSON
        // =========================

        data =
          await response.json();


        console.log(
          `Overpass server worked: ${server}`
        );

        break;


      } catch (error) {

        console.log(
          `Overpass connection failed: ${server}`
        );

        console.log(
          error.message
        );

        lastError = error;

      }

    }


    // =========================
    // ALL SERVERS FAILED
    // =========================

    if (!data) {

      console.log(
        "ALL OVERPASS SERVERS FAILED"
      );

      return res.status(503).json({
        message:
          "Nearby places service is temporarily unavailable.",

        error:
          lastError?.message ||
          "All Overpass servers failed."
      });

    }


    // =========================
    // REMOVE DUPLICATES
    // =========================

    const uniquePlaces = new Map();


    (data.elements || []).forEach(
      (place) => {

        if (!place.tags?.name) {
          return;
        }


        const key =
          `${place.type}-${place.id}`;


        uniquePlaces.set(
          key,
          place
        );

      }
    );


    // =========================
    // FORMAT RESULTS
    // =========================

    const places =
      Array.from(uniquePlaces.values())

        .map((place) => {

          const tags =
            place.tags || {};


          const placeLatitude =
            place.lat ??
            place.center?.lat;


          const placeLongitude =
            place.lon ??
            place.center?.lon;


          return {

            id:
              `${place.type}-${place.id}`,

            name:
              tags.name,

            type,

            address:
              [
                tags["addr:housenumber"],
                tags["addr:street"],
                tags["addr:city"]
              ]
                .filter(Boolean)
                .join(" ") ||
              tags["addr:place"] ||
              "Address unavailable",

            city:
              tags["addr:city"] ||
              "",

            country:
              tags["addr:country"] ||
              "",

            website:
              tags.website ||
              tags["contact:website"] ||
              "",

            phone:
              tags.phone ||
              tags["contact:phone"] ||
              "",

            cuisine:
              tags.cuisine ||
              "",

            stars:
              tags.stars ||
              "",

            latitude:
              placeLatitude,

            longitude:
              placeLongitude

          };

        })

        .filter(
          (place) =>
            place.latitude !== undefined &&
            place.longitude !== undefined
        )

        .slice(0, 6);


    console.log(
      `${type.toUpperCase()} FOUND:`,
      places.length
    );


    // =========================
    // RESPONSE
    // =========================

    res.json(places);


  } catch (error) {

    console.log(
      "NEARBY PLACES ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch nearby places",

      error:
        error.message
    });

  }
};


module.exports = {
  getNearbyPlaces
};
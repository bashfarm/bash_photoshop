const openJpg = async () => {
    const jpg = await fs.getPluginFolder().then(folder => folder.getEntry("img/cat.jpg"))
    await executeAsModal(async () => {
        return await app.open(jpg);
    }, { commandName: "open File" })
    // photoshop.core.performMenuCommand({commandId: 1192});
}

const pickJpgDOM = async () => {
    const jpg = await fs.getFileForOpening({ types: ["jpg"] });
    if (!jpg) return;
    await executeAsModal(async () => {
        return await app.open(jpg);
    }, { commandName: "open File" })
}

const pickJpgBatchPlay = async () => {
    const jpg = await fs.getFileForOpening({ types: ["jpg"] });
    if (!jpg) return;
    let tkn = fs.createSessionToken(jpg);
    const res = await executeAsModal(async () => {
        await bp([{
            _obj: "open",
            target: { _path: tkn, _kind: "local" }
        }], {});
    }, { commandName: "open File" })
}

const placeJpg = async () => {
    const placedDocument = await fs.getFileForOpening({ types: ["jpg"] });
    if (!placedDocument) return;
    let tkn = fs.createSessionToken(placedDocument);
    const res = await executeAsModal(async () => {
        await bp([{
            _obj: "placeEvent",
            target: { _path: tkn, _kind: "local" },
            linked: true
        }], {})
    }, { commandName: "open File" })
}


const pickJpgSavingToken = async () => {
    const userSelected = await fs.getFileForOpening({ types: fileTypes.images });
    if (!userSelected) return;
    const persistentTkn = await fs.createPersistentToken(userSelected);
    localStorage.setItem("alwaysAvailable", persistentTkn);
}

const openJpgFromToken = async () => {
    let f = await fs.getEntryForPersistentToken(localStorage.getItem("alwaysAvailable"));
    if (!f) return;
    const sessionTkn = fs.createSessionToken(f);
    console.log({ f })
    // app.open(f); // open the f File instance with DOM, or use the token with BP
    const res = await executeAsModal(async () => {
        await bp([{
            _obj: "open",
            target: { _path: sessionTkn, _kind: "local" }
        }], {});
    }, { commandName: "open File" })
}

const getFolderOpenJpgs = async () => {
    const userSelected = await fs.getFolder();
    if (!userSelected) return;
    const jpgs = await userSelected.getEntries()
        .then(entries => entries.filter(entry => entry.isFile && entry.name.slice(-3).toLowerCase() === "jpg"))
    for (const jpg of jpgs) {
        console.log("Opening", jpg.name);
        const res = await executeAsModal(async () => {
            await app.open(jpg);
        }, { commandName: "open File" })
    }
}

const getJpgSaveRenamed = async () => {
    const userSelected = await fs.getFolder();
    if (!userSelected) return;
    const jpg = await userSelected.getEntries()
        .then(entries => entries.filter(entry => entry.isFile && entry.name.slice(-3) === "jpg")[0])
    await executeAsModal(async () => {
        await app.open(jpg);
    }, { commandName: "open File" })

    let newJpg = await userSelected.createEntry("" + jpg.name.slice(0, -4) + "-DUP.jpg")
    let tkn = fs.createSessionToken(newJpg) // <=creating a new token each time
    const res = await executeAsModal(async () => {
        await bp([{
            _obj: "save",
            as: {
                _obj: "JPEG", extendedQuality: 10,
                matteColor: { _enum: "matteColor", _value: "none" }
            },
            in: { _path: tkn, _kind: "local" },
            copy: true, lowerCase: true,
            saveStage: { _enum: "saveStageType", _value: "saveBegin" },
        }], {})
    }, { commandName: "open File" })
    photoshop.core.showAlert(`Saved ${jpg.name} as ${newJpg.name}`)
}
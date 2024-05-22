import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { decode, simplify } from "./decoder";
import { Dispatch } from "./dispatch";

const StarRailDir = process.argv.slice(2)[0];

const readString = (buffer: Buffer, offset: number): string => {
    const lengthByte = buffer.readUInt8(offset);
    const endPos = offset + lengthByte + 1;
    const stringData = buffer.toString('utf8', offset + 1, endPos);
    return stringData;
};

const stripEmptyBytes = (buffer: Buffer): Buffer => {
    let end = buffer.length;
    while (end > 0 && buffer[end - 1] === 0x00) {
    end--;
    }
    return buffer.subarray(0, end);
}

const lastIndexOf = (buffer: Buffer, delimiter: number) => {
    let start = 0;
    let parts = [];
    for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === delimiter) {
            parts.push(buffer.subarray(start, i));
            start = i + 1;
        }
    }
    if (start < buffer.length) {
        parts.push(buffer.subarray(start));
    }
    return parts[parts.length - 1];
}

const findSequence = (buffer: Buffer, sequence: number[]) => {
    for (let i = 0; i < buffer.length - sequence.length; i++) {
      let match = true;
      for (let j = 0; j < sequence.length; j++) {
        if (buffer[i + j] !== sequence[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        return i;
      }
    }
    return -1;
};

async function main() {
    const buffer_BinaryVersion: Buffer = fs.readFileSync(path.join(StarRailDir, 'StarRail_Data', 'StreamingAssets', 'BinaryVersion.bytes'));
    const buffer_ClientConfig: Buffer = fs.readFileSync(path.join(StarRailDir, 'StarRail_Data', 'StreamingAssets', 'ClientConfig.bytes'));

    // StartDesignData
    const sequence = [0x53, 0x74, 0x61, 0x72, 0x74, 0x44, 0x65, 0x73, 0x69, 0x67, 0x6E, 0x44, 0x61, 0x74, 0x61];
    const buffer_ClientConfig_parts = stripEmptyBytes(buffer_ClientConfig);
    const query_dispatch_pre:string = readString(lastIndexOf(buffer_ClientConfig_parts, 0x00), 0);

    // Find the start of the sequence
    const startIndex = findSequence(buffer_BinaryVersion, sequence);
    if (startIndex === -1) {
      console.error('Sequence not found');
      return;
    }
  
    // Skip the sequence
    let offset = startIndex + sequence.length;
  
    // Skip 1 byte
    offset += 1;
  
    // Read seed string
    let seedStr = readString(buffer_BinaryVersion, offset);
    console.log(`Dispatch Seed: ${seedStr}`);

    // Skip bytes
    offset += seedStr.length+2;

    // Read verion string
    let versionStr = readString(buffer_BinaryVersion, offset);

    // Get the version number
    let versionSplit = versionStr.split('-');
    let version:string = versionSplit[versionSplit.length - 2];
    let build:string = versionSplit[versionSplit.length - 1];
    
    console.log(`Version: ${version}`);
    console.log(`Build: ${build}`);

    // For the switch
    let urlStart;

    // The data to return
    let returnData = {
        assetBundleUrl: "",
        exResourceUrl: "",
        luaUrl: "",
        ifixUrl: "",
        customMdkResVersion: 0,
        customIfixVersion: 0,
    }

    // Fetch the dispatch
    try {
        const url_dispatch = `${query_dispatch_pre}?version=${version}&language_type=3&platform_type=3&channel_id=1&sub_channel_id=1&is_new_format=1`;
        console.log(url_dispatch);
        const response_dispatch = await axios.get(url_dispatch);
        var protoBytes_dispatch = Buffer.from(response_dispatch.data, 'base64');
        var decodedDispatch:Dispatch = Dispatch.decode(protoBytes_dispatch);
        if (decodedDispatch.regionList.length == 0) {
            console.log('No regions found, make sure the version is correct and the game is not in maintenance mode');
            return;
        }
        urlStart = decodedDispatch.regionList[0].dispatchUrl.toString();
    } catch (error) {
        console.error('Error fetching dispatch:', error);
    }

    // construct the url
    const url = `${urlStart}?version=${version}&language_type=3&dispatch_seed=${seedStr}&channel_id=1&sub_channel_id=1&is_need_url=1`;

    console.log(url);

    // fetch the url
    try {
        const response = await axios.get(url);
        var protoBytes = Buffer.from(response.data, 'base64');
        var decoded = decode(protoBytes);
        var simplified = simplify(decoded);
        for (let field of simplified.fields) {
            let val:string = field.value.toString();
            if (val.includes('/asb/')) {
                returnData.assetBundleUrl = val;
            } else if (val.includes('/design_data/')) {
                returnData.exResourceUrl = val;
            } else if (val.includes('/lua/')) {
                returnData.luaUrl = val;
            } else if (val.includes('/ifix/')) {
                returnData.ifixUrl = val;
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    // Finally, output the data to a file
    await fs.writeFileSync(path.join(__dirname, 'hotfix.json'), JSON.stringify(returnData, null, 2));
    console.log('Data written to hotfix.json');

}

main();
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { decode, simplify } from "./decoder";

const StarRailDir = process.argv.slice(2)[0];

const readString = (buffer: Buffer, offset: number): string => {
    const lengthByte = buffer.readUInt8(offset);
    const endPos = offset + lengthByte + 1;
    const stringData = buffer.toString('utf8', offset + 1, endPos);
    return stringData;
};

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
    const buffer: Buffer = fs.readFileSync(path.join(StarRailDir, 'StarRail_Data', 'StreamingAssets', 'BinaryVersion.bytes'));
  
    // StartDesignData
    const sequence = [0x53, 0x74, 0x61, 0x72, 0x74, 0x44, 0x65, 0x73, 0x69, 0x67, 0x6E, 0x44, 0x61, 0x74, 0x61];
  
    // Find the start of the sequence
    const startIndex = findSequence(buffer, sequence);
    if (startIndex === -1) {
      console.error('Sequence not found');
      return;
    }
  
    // Skip the sequence
    let offset = startIndex + sequence.length;
  
    // Skip 1 byte
    offset += 1;
  
    // Read seed string
    let seedStr = readString(buffer, offset);
    console.log(`Dispatch Seed: ${seedStr}`);

    // Skip bytes
    offset += seedStr.length+2;

    // Read verion string
    let versionStr = readString(buffer, offset);

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

    switch (build) {
        case 'OSCb':
            urlStart = 'https://beta-release01-asia.starrails.com';
            break;
        case 'CNCb':
            urlStart = 'https://beta-release01-cn.bhsr.com';
            break;
        case 'OSLive':
            urlStart = 'https://globaldp-prod-os02.starrails.com';
            break;
        case 'CNLive':
            urlStart = 'https://globaldp-prod-cn02.bhsr.com';
            break;
        default:
            throw new Error('Unknown version detected');
    }

    // construct the url
    const url = `${urlStart}/query_gateway?version=${version}&language_type=3&dispatch_seed=${seedStr}&channel_id=1&sub_channel_id=1&is_need_url=1`;

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
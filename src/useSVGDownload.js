import { useControls, button } from "leva";
import { useRef } from "react"

export default function useSVGDownload(ref, name = "data") {
  const download = useRef(document.createElement("a"));

  useControls({
    [`${name} download`]: button(() => {
      if(ref.current) {
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(ref.current);
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }   
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
  
        var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
        download.current.href = url;
        download.current.download = `${name}.svg`;
        download.current.click();
      }
      
    })
  })
}
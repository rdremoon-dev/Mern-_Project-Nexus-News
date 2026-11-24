import ImageKit from 'imagekit-javascript';

export const uploadFileToImageKit = async (
  file,
  token,
  apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000',
) => {
  const authRes = await fetch(`${apiUrl}/api/imagekit/auth`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!authRes.ok) {
    throw new Error('Failed to get ImageKit upload signature');
  }

  const authData = await authRes.json();
  const imagekit = new ImageKit({
    publicKey: authData.publicKey,
    urlEndpoint: authData.urlEndpoint,
  });

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file,
        fileName: `nexus-${Date.now()}-${file.name}`,
        folder: '/nexus-news',
        signature: authData.signature,
        expire: authData.expire,
        token: authData.token,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result); // { url, fileId, ... }
      },
    );
  });
};

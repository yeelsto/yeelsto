<template>
  <div class="flex flex-col items-center">
    <h1 class="text-xl">Test</h1>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5"
      @click="getFiles"
    >Refresh</button>

    <ul class="text-center mt-5">
      <li
        v-for="f in files"
        :key="f.id"
        class="cursor-pointer border bg-blue-500 rounded-lg px-2 py-1 mb-2 text-white flex items-center justify-between"
      >
        <span
          class="underline"
          @click="currentDownload = f"
        >{{ f.name }}</span>
        <span
          class="bg-red-500 rounded px-2 py-1"
          @click="deleteFile(f.id)"
        >X</span>
      </li>
    </ul>

    {{ currentDownload }}

    <!-- {{ uploadFiles }} -->

    <form
      class="flex flex-col mt-5"
      @submit="onSubmit"
    >
      <input
        type="file"
        multiple
        webkitdirectory
        @change="onChange"
      >
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5"
      >Upload</button>
    </form>

    <p>{{ uploadPercentage }}</p>

    <button
      type="button"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5"
      @click="downloadFile"
    >Download</button>

    <a
      :href="`/download/${currentDownload.id || 100}`"
      target="__blank"
    >Dowload</a>

  </div>
</template>

<script>
export default {
  name: 'TestPage',
  data() {
    return {
      uploadPercentage: 0,
      files: [],
      currentDownload: '',
      dropListener: {
        onDragOver: (e) => {
          e.preventDefault()
          e.stopPropagation()
        },
        onDrop: (e) => {
          e.preventDefault()
          e.stopPropagation()
          function traverseFileTree(item, createDirectory, uploadFiles) {
            return new Promise((resolve, reject) => {
              if (item.isFile) {
                item.file((f) => {
                  resolve(f)
                })
              } else if (item.isDirectory) {
                const dirReader = item.createReader()
                dirReader.readEntries(async (entries) => {
                  const files = []
                  const parentId = (await createDirectory(item.name)).id
                  for (let i = 0; i < entries.length; i++) {
                    const file = await traverseFileTree(
                      entries[i],
                      createDirectory,
                      uploadFiles
                    )
                    if (file instanceof File) files.push(file)
                  }
                  await uploadFiles(files, parentId)
                })
                resolve(item)
              }
            })
          }

          const items = e.dataTransfer.items
          for (let i = 0; i < items.length; i++) {
            // webkitGetAsEntry is where the magic happens
            const item = items[i].webkitGetAsEntry()
            if (item) {
              traverseFileTree(item, this.createDirectory, this.uploadFiles)
            }
          }

          // this.uploadFiles = files
        },
      },
    }
  },
  created() {
    this.getFiles()
  },
  mounted() {
    document.addEventListener('dragover', this.dropListener.onDragOver)
    document.addEventListener('drop', this.dropListener.onDrop)
  },
  beforeDestroy() {
    document.removeEventListener('dragover', this.dropListener.onDragOver)
    document.removeEventListener('drop', this.dropListener.onDrop)
  },
  methods: {
    onChange(e) {},
    async createDirectory(name) {
      const { data } = await this.$axios.post('/directory', {
        name,
      })
      return data?.data?.directory || {}
    },
    async uploadFiles(files, parentId) {
      try {
        const formData = new FormData()
        for (let i = 0; i < files.length; i++) {
          formData.append('file', files[i])
        }
        await this.$axios.post(`/upload?parentId=${parentId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onError: (e) => {
            console.log(e)
          },
          onUploadProgress: (progressEvent) => {
            this.uploadPercentage = parseInt(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            )
          },
        })
        this.getFiles()
      } catch (e) {
        console.log(e)
      }
    },
    async deleteFile(id) {
      for (let i = 0; i < this.files.length; i++) {
        await this.$axios.delete(`/file/${this.files[i].id}`)
      }
      this.getFiles()
    },
    downloadFile() {
      this.$axios
        .get(`/download/${this.currentDownload.id}`, {
          // .get('http://127.0.0.1:3000/download', {
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            console.log(progressEvent)
            this.uploadPercentage = parseInt(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            )
          },
        })
        .then(function (response) {
          console.log('SUCCESS!!')

          const fileURL = window.URL.createObjectURL(new Blob([response.data]))
          const fileLink = document.createElement('a')

          fileLink.href = fileURL
          fileLink.setAttribute(
            'download',
            response.headers['content-disposition']
              .split('=')[1]
              .replaceAll('\\', '')
              .replaceAll('"', '')
          )
          document.body.appendChild(fileLink)

          fileLink.click()
        })
        .catch(function () {
          console.log('FAILURE!!')
        })
    },
    async getFiles() {
      this.files = []
      const { data } = await this.$axios.get('/files')
      this.files = data.data.files
    },
  },
}
</script>
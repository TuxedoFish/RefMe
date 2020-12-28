// Takes id - x5gon document id
// meta - PDF meta data
// onSuccess(id, citation)

import { PAGE_TYPES } from "../screens/ArticlesScreen/Constants"

// onFailed(error)
export async function generateCitation(id, meta, onSuccess, onFailed) {
    // Fetch data from X5gon and combine with pdf meta
    // TODO: Implement this function
    // 10937: {
    //   id: 10937,
    //   author: "John Doe",
    //   title: "ML Algorithms",
    //   uploadedDate: 30817921,
    //   accessedDate: 30817921,
    //   publisher: "VideoLectures.Net",
    //   url: "https://www.website.com",
    //   type: (ENUM)
    //   pages: "1-4", (This will be a feature on the citation screen)
    //   ...
    // }

    // Setup to make a query for the document
    const PLATFORM_URL = "https://platform.x5gon.org/api/v1"
    const ENDPOINT = "/oer_materials/" + id
    const url = PLATFORM_URL + ENDPOINT
    
    axios.get(url, {} )
    .then(res => {
        // Get the response from x5gon
        const article = res.data.oer_materials
        // Generate accessed date
        const accessed_date = new Date().toISOString();
        // Get the published date from PDF metadata (also option ref.creation_date===null ? ref.retrieved_date : ref.creation_date)
        const published_date = meta.modDate
        // Get the author from PDF metadata
        const author = meta.author==="" ? "Unknown" : meta.author
        // Publisher
        const publisher = article.provider.provider_name
        // Link
        const url = article.url
        // Title of paper
        const title = article.title

        // Put it all together:
        const citation = {
            id: id,
            accessed_date: accessed_date,
            published_date: published_date,
            author: author,
            publisher: publisher,
            url: url,
            title: title,
            type: PAGE_TYPES.PDF
        }
        // Callback function
        onSuccess(id, citation)
    })
    .catch(error => {
      onFailed(error)
    })
}

export function generateTextForCitation(citation, index, style) {

    // Destructure elements from citation 
    const { author, accessed_date, published_date, publisher, url, title} = citation

    // Author initials
    var initials = author.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

    // Return the raw text style of the citation
    return (index+1) + ": " + author + ", " + initials + ", " + title + ", " + publisher + ", " + 
    published_date + ". Available from: " + url
}